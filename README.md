[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/yE1ZBsQj)
# React Lab: User Management Dashboard

> **Note:**
> Please follow the `app.jsx` file to implement the TODOs.
>
> Please use app.jsx file to perform TODOs and follow the steps strictly to gain good marks in the assignment.  
>  
> **Due Date:** 4 March, 2026, **20:59 PM**

## Overview
In this lab, students will learn to:
- Apply custom CSS styling to React components.
- Use Bootstrap and React-Bootstrap components for layout and UI.
- Fetch and display data from an API using React hooks (`useState` and `useEffect`).

## Reading Assignment
- 5.15 Styling
- 5.16 React Bootstrap
- 5.17 Fetching Data

---

## Concepts and Code Syntax

---

### 1. Bootstrap
**What is Bootstrap?**
- Bootstrap is a CSS framework for building responsive and mobile-first web interfaces quickly.
- React-Bootstrap wraps Bootstrap components as React components.

**Common Bootstrap components:**
- Container, Row, Col, Card, Button, Modal, Alert

**Example syntax:**
```jsx
import { Button, Card } from 'react-bootstrap';

<Card className="shadow-sm mb-3">
  <Card.Body>
    <Card.Title>Title</Card.Title>
    <Card.Text>Some text</Card.Text>
    <Button variant="primary">Click Me</Button>
  </Card.Body>
</Card>
```

**Common classes:**
- `mb-4`, `py-3`, `text-center`, `bg-primary`, `text-white`, `shadow`

---

### 2. Fetching Data using API
**Calling fetch function:**
```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

**React Hooks:**
- `useState` stores state variables
- `useEffect` runs side effects like fetching data

```javascript
import { useState, useEffect } from 'react';

const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.example.com/data');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

---

---

### 3. Modals in React (Popup Windows)

A **modal** is a popup window that appears **on top of the current page** to show extra information (such as user details) without navigating to a new page.

**Common modal use cases:**
- Viewing details (e.g., user profile details)
- Confirming actions (e.g., “Are you sure you want to delete?”)
- Displaying forms (e.g., “Add new user”)

**How a modal works in React:**
- A modal is typically controlled using **state** (a boolean value).
- When the state is `true`, the modal is shown.
- When the state is `false`, the modal is hidden.

Example concept:
- `showModal = true` → modal is visible  
- `showModal = false` → modal is hidden  

**React-Bootstrap Modal**
In this lab, you will use the React-Bootstrap `<Modal>` component. It is usually controlled using two props:
- `show` → controls whether the modal is visible or not
- `onHide` → a function that runs when the modal should close (X button, Close button, etc.)

**Typical modal flow in this lab:**
1. User clicks **"View Details"** on a user card.
2. The app saves that user into `selectedUser`.
3. The app sets `showModal` to `true` to display the modal.
4. User clicks **Close** (or X button).
5. The app sets `showModal` to `false` and clears `selectedUser`.

---

## Checklist Before Submitting Lab

- [ ] **Header** className is exactly: `bg-primary text-white py-3 mb-4 shadow`
- [ ] **Footer** className is exactly: `bg-light py-4 mt-5`
- [ ] **SearchBar** wrapper `<div>` className is exactly: `mb-4`

- [ ] **UserList (Empty State):** when `users.length === 0`, return:
  - [ ] `<Alert variant="info">`
  - [ ] Message is exactly: `No users found matching your search criteria.`

- [ ] **UserList (Grid):**
  - [ ] Uses `<Row>`
  - [ ] Maps users using `users.map(...)`
  - [ ] Each user renders in: `<Col key={user.id} md={6} lg={4} className="mb-4">`
  - [ ] Each `<Col>` contains: `<UserCard user={user} onUserClick={onUserClick} />`

- [ ] **Fetch Users (App.jsx):**
  - [ ] Implemented inside the **first** `useEffect` (runs once)
  - [ ] Calls `setLoading(true)` before fetching
  - [ ] Calls `setError(null)` before fetching
  - [ ] Fetches from: `https://jsonplaceholder.typicode.com/users`
  - [ ] Converts response to JSON
  - [ ] Stores results in both `users` and `filteredUsers`
  - [ ] On error: sets `error` using `err.message`
  - [ ] Always stops loading using `setLoading(false)` in `finally`

- [ ] **Filter Users (App.jsx):**
  - [ ] Implemented inside the **second** `useEffect`
  - [ ] If `searchTerm` is empty: `setFilteredUsers(users)`
  - [ ] Else: filters by `user.name` only (case-insensitive `includes`)
  - [ ] Dependency array is exactly: `[searchTerm, users]`

- [ ] **UserCard (View Details Button):**
  - [ ] Adds **one** React-Bootstrap `<Button>` inside `<Card.Body>`
  - [ ] Button text is exactly: `View Details`
  - [ ] Button `onClick` calls `onUserClick(user)` (passes the current user object)

- [ ] **UserModal (User Details Modal):**
  - [ ] Uses React-Bootstrap `<Modal>` with `show={show}` and `onHide={onHide}`
  - [ ] Header includes close (X) button
  - [ ] Title text is exactly: `User Details`
  - [ ] Body shows a large avatar using className `user-avatar-large` with first letter of `user.name`
  - [ ] Body shows **Name, Email, Phone, Website**
  - [ ] Footer has **one** Close button that triggers `onHide`

- [ ] **Bootstrap CSS Loaded:** Bootstrap styles are included (via import or `<link>`)
