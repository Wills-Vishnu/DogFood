from tests.factories import API, error_code

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


def test_upload_image_is_stored_locally_and_served(login_as):
    alice = login_as("alice")
    response = alice.post(f"{API}/uploads/images", files={"file": ("shot.png", PNG, "image/png")})
    assert response.status_code == 201, response.text
    url = response.json()["url"]
    assert url.startswith("/uploads/") and url.endswith(".png")

    served = alice.get(url)
    assert served.status_code == 200
    assert served.content == PNG
    assert served.headers["x-content-type-options"] == "nosniff"


def test_upload_type_is_sniffed_not_trusted(login_as):
    response = login_as("alice").post(
        f"{API}/uploads/images", files={"file": ("evil.png", b"<script>alert(1)</script>", "image/png")}
    )
    assert response.status_code == 422
    assert error_code(response) == "validation_error"


def test_upload_size_limit(login_as):
    oversized = PNG + b"\x00" * (5 * 1024 * 1024)
    response = login_as("alice").post(f"{API}/uploads/images", files={"file": ("big.png", oversized, "image/png")})
    assert response.status_code == 413
