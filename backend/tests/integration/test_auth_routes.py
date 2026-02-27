def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "username": "testuser", "password": "secret123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"
    assert "access_token" in response.cookies


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "username": "user1", "password": "pass123"}
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "username": "user2", "password": "pass456"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "mypassword"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Logged in successfully"
    assert data["user"]["email"] == "login@example.com"
    assert "access_token" in response.cookies


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "wrong"}
    )
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


def test_get_me_with_valid_cookie(client):
    client.post(
        "/api/auth/register",
        json={"email": "me@example.com", "username": "meuser", "password": "mepass123"}
    )
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "me@example.com", "password": "mepass123"}
    )
    token = login_resp.cookies.get("access_token")
    response = client.get("/api/me", cookies={"access_token": token})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["username"] == "meuser"


def test_get_me_without_cookie(client):
    response = client.get("/api/me")
    assert response.status_code == 401
