/*
===================================================================
React Lab - USER MANAGEMENT DASHBOARD
===================================================================

===================================================================
LAB SETUP INSTRUCTIONS
===================================================================

1. Navigate to the project directory:
   Open your terminal and run:
      cd 5-6-react-styling-fetch-data

2. Install project dependencies:
   Run either of these commands:
      npm i
      OR
      npm install

3. Install React-Bootstrap and Bootstrap:
   Run the following command:
      npm install react-bootstrap bootstrap

4. Start the development server:
   Run:
      npm run dev

   If your system blocks running npm commands (especially on Windows PowerShell),
   run this command first to allow script execution:
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

5. Link Bootstrap CSS to your React project:
   Open the file: public/index.html
   Inside the <head> tag, add this line:
      <link 
         href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
         rel="stylesheet"
      >

=============================================================
TODO 1 — BOOTSTRAP LAYOUT + USER LIST GRID + EMPTY STATE
=============================================================
TODO 1.1: File: src/App.jsx
- In the <header> tag, set className to EXACTLY:
   "bg-primary text-white py-3 mb-4 shadow"
- In the <footer> tag, set className to EXACTLY:
   "bg-light py-4 mt-5" ✅

TODO 1.2: File: src/components/SearchBar.jsx
- SEARCH BAR SPACING: In the wrapper <div>, set className to EXACTLY:
   "mb-4". ✅

TODO 1.3: File: src/components/UserList.jsx
- Empty state:
  If users.length === 0, RETURN this EXACT element:
    <Alert variant="info">
      No users found matching your search criteria.
    </Alert> ✅

- Grid layout:
  In the return statement:
    1) Render a <Row>
    2) Inside <Row>, map over users using users.map(...)
    3) For each user, render:
       <Col key={user.id} md={6} lg={4} className="mb-4">
         <UserCard user={user} onUserClick={onUserClick} />
       </Col>
   4) Inside each <Col>, render:
       <UserCard user={user} onUserClick={onUserClick} />

=============================================================
TODO 2 — FETCH USERS + FILTER USERS BY NAME
=============================================================
TODO 2.1: File: src/App.jsx ✅
Implement the fetch logic inside the first useEffect.

Requirements (write EXACT behavior):
1) setLoading(true)
2) setError(null)
3) fetch from:
   "https://jsonplaceholder.typicode.com/users"
4) Convert response to JSON
5) Store the result:
   setUsers(data)
   setFilteredUsers(data)
6) On error:
   setError(err.message)
7) Always (finally):
   setLoading(false)

Hint:
- Use an async function inside useEffect, then call it.
- Check response.ok and throw an Error if it’s false (otherwise errors won’t go to catch cleanly).

TODO 2.2: File: src/App.jsx ✅
Implement the filtering logic inside the second useEffect.

Requirements:
1) If searchTerm is empty:
   setFilteredUsers(users)
2) Else:
   - filter users by name ONLY
   - case-insensitive match using includes()
   - then setFilteredUsers(filtered)
   Hint:
      - Always compute from the full users array, not from filteredUsers (prevents “double filtering” bugs).
      - Make sure .toLowerCase() is applied to both user.name and searchTerm.
Dependency array MUST be:
   [searchTerm, users]

=============================================================
TODO C1 — VIEW DETAILS BUTTON + USER DETAILS MODAL
=============================================================
TODO 3.1: File: src/components/UserCard.jsx ✅
Implement:
- Add ONE Bootstrap <Button> inside <Card.Body>
- Button text MUST be: "View Details"
- On click, it MUST call onUserClick and pass the current user object

Hint:
- You already have access to both props: user and onUserClick.
- Your onClick must be a function (do NOT call onUserClick immediately).
   Inside <Card.Body> (below <Card.Text>), add something like:
   <Button
   // onClick should call the handler and pass the current user
   onClick={ TODO: write a function here }
   >
   { TODO: put the exact text here }
   </Button>

TODO 3.2 -  File: src/components/UserModal.jsx
Implement:
- Replace placeholder with a React-Bootstrap <Modal>
- show prop controls visibility, onHide closes it (also enables the X button)
- Title MUST be: "User Details"
- Body MUST show:
  - Large avatar: first letter of user name (CSS class "user-avatar-large")
  - Name, Email, Phone, Website (each in its own <p>)
- Footer MUST have ONE Close button that triggers onHide

Hint:
- Use Modal subcomponents: Header/Title/Body/Footer.
- For the avatar, use user.name.charAt(0) and the className "user-avatar-large".
- The close button should call onHide when clicked.
   <Modal
   show={ TODO: use the prop }
   onHide={ TODO: use the prop }
   >
   <Modal.Header closeButton>
      <Modal.Title>
         { TODO: exact title text }
      </Modal.Title>
   </Modal.Header>

   <Modal.Body>
      <div className="user-avatar-large">
         { TODO: first character of user name }
      </div>

      <p><strong>Name:</strong> { TODO }</p>
      <p><strong>Email:</strong> { TODO }</p>
      <p><strong>Phone:</strong> { TODO }</p>
      <p><strong>Website:</strong> { TODO }</p>
   </Modal.Body>

   <Modal.Footer>
      <Button
         variant="secondary"
         onClick={ TODO: call the close handler }
      >
         Close
      </Button>
   </Modal.Footer>
   </Modal>

===================================================================
END OF LAB INSTRUCTIONS
===================================================================
*/

import { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import SearchBar from "./components/SearchBar";
import UserList from "./components/UserList";
import UserModal from "./components/UserModal";
import "./index.css";

export default function App() {
  // State variables (already complete for students)
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* =========================================================
     TODO 2.1 — FETCH USERS (Runs once)
     File: src/App.jsx
     ---------------------------------------------------------
     Implement fetch logic inside this useEffect.
     ========================================================= */
  useEffect(() => {
    // TODO 2.1: Implement fetching users here (see lab instructions)
    const fetchUsers = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    setUsers(data);
    setFilteredUsers(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

fetchUsers();
  }, []);

  /* =========================================================
     TODO 2.2 — FILTER USERS BY NAME
     File: src/App.jsx
     ---------------------------------------------------------
     Implement filtering logic inside this useEffect.
     Dependency array MUST be: [searchTerm, users]
     ========================================================= */
  useEffect(() => {
    // TODO 2.2: Implement filtering users here (see lab instructions)
         if (!searchTerm) {
      setFilteredUsers(users);
      return;
      }

      const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Modal handlers (already complete)
  function handleUserClick(user) {
    setSelectedUser(user);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedUser(null);
  }

  return (
    <div className="app">
      {/* TODO 1.1: Set header className EXACTLY as in lab instructions */}
      <header className="bg-primary text-white py-3 mb-4 shadow">
        <Container>
          <h1 className="h2 mb-0">User Management Dashboard</h1>
          <p className="mb-0 opacity-75">Search users and view details</p>
        </Container>
      </header>

      <Container>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Loading & Error UI (already complete) */}
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Show list only when not loading and no error */}
        {!loading && !error && (
          <UserList users={filteredUsers} onUserClick={handleUserClick} />
        )}

        <UserModal show={showModal} user={selectedUser} onHide={handleCloseModal} />
      </Container>

      {/* TODO 1.1: Set footer className EXACTLY as in lab instructions */}
      <footer className="bg-light py-4 mt-5">
        <Container>
          <small className="text-muted">SWE 363 — React Lab</small>
        </Container>
      </footer>
    </div>
  );
}
