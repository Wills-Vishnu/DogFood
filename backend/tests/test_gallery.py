import pytest

from tests.factories import API, create_draft, create_event, create_team, submit_project


@pytest.fixture
def projects(login_as, db, users, event):
    alice = login_as("alice")
    solar = submit_project(alice, event, create_team(alice, event.id, "Sunrise")["id"])

    bob = login_as("bob")
    health = submit_project(
        bob,
        event,
        create_team(bob, event.id, "Pulse")["id"],
        title="Heart Beat",
        tagline="Wearable 100% offline monitoring",
        description="Tracks heart rate trends.",
        track_id=event.tracks[1].id,
        tags=["Rust", "Embedded"],
    )

    carol = login_as("carol")
    draft = create_draft(carol, create_team(carol, event.id, "Secret")["id"])
    carol.patch(f"{API}/submissions/{draft['id']}", json={"title": "Hidden Draft Project"})

    # A project submitted while its event was published must disappear once the event is unpublished.
    hidden_event = create_event(db, users["organizer"], name="Hidden Hack")
    dave = login_as("dave")
    unpublished = submit_project(dave, hidden_event, create_team(dave, hidden_event.id, "Ghost")["id"], title="Ghost Project")
    login_as("organizer").patch(f"{API}/events/{hidden_event.id}", json={"is_published": False})

    return {"solar": solar, "health": health, "draft": draft, "unpublished": unpublished}


def _titles(client, **params) -> list[str]:
    response = client.get(f"{API}/gallery/projects", params=params)
    assert response.status_code == 200, response.text
    return [item["title"] for item in response.json()["items"]]


def test_only_submitted_projects_in_published_events_are_listed(client, projects):
    assert sorted(_titles(client)) == ["Heart Beat", "Solar Scout"]


def test_project_detail_visibility(client, projects):
    detail = client.get(f"{API}/gallery/projects/{projects['solar']['id']}")
    assert detail.status_code == 200
    body = detail.json()
    assert body["team"] == {"name": "Sunrise", "members": ["Alice"]}
    assert body["track"]["name"] == "AI"
    assert body["repo_url"] == "https://github.com/example/solar-scout"
    assert "@" not in detail.text
    assert "answers" not in body

    assert client.get(f"{API}/gallery/projects/{projects['draft']['id']}").status_code == 404
    assert client.get(f"{API}/gallery/projects/{projects['unpublished']['id']}").status_code == 404


@pytest.mark.parametrize(
    ("query", "expected"),
    [
        ("solar", ["Solar Scout"]),
        ("OFFLINE", ["Heart Beat"]),
        ("rust", ["Heart Beat"]),
        ("pulse", ["Heart Beat"]),
        ("web", ["Heart Beat"]),
        ("100%", ["Heart Beat"]),
        ("hidden draft", []),
        ("ghost", []),
    ],
)
def test_search(client, projects, query, expected):
    assert _titles(client, q=query) == expected


def test_filters(client, projects, event):
    assert _titles(client, track_id=event.tracks[1].id) == ["Heart Beat"]
    assert _titles(client, tag="python") == ["Solar Scout"]
    assert sorted(_titles(client, event_id=event.id)) == ["Heart Beat", "Solar Scout"]
    assert _titles(client, event_id=event.id, tag="rust", q="heart") == ["Heart Beat"]


def test_sorting_and_pagination(client, projects):
    assert _titles(client, sort="title") == ["Heart Beat", "Solar Scout"]
    page = client.get(f"{API}/gallery/projects", params={"page_size": 1, "page": 2, "sort": "title"}).json()
    assert (page["total"], page["pages"], page["page"]) == (2, 2, 2)
    assert [item["title"] for item in page["items"]] == ["Solar Scout"]


def test_filter_options(client, projects, event):
    body = client.get(f"{API}/gallery/filters").json()
    assert [item["id"] for item in body["events"]] == [event.id]
    assert {track["name"] for track in body["tracks"]} == {"AI", "Web"}
    assert "Python" in body["tags"]


def test_empty_gallery(client):
    body = client.get(f"{API}/gallery/projects").json()
    assert (body["items"], body["total"], body["pages"]) == ([], 0, 1)
