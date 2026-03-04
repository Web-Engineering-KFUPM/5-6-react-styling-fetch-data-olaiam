import React from "react";
import { Row, Col, Alert } from "react-bootstrap";
import UserCard from "./UserCard";

function UserList({ users, onUserClick }) {
  // TODO 1.3: Empty state — if users.length === 0, RETURN the exact <Alert variant="info">...</Alert>
  if (users.length === 0) {
    return (
      <Alert variant="info">
        {/* TODO 1.3: Change this Alert to variant="info" and exact message from lab instructions */}
        No users found matching your search criteria.
      </Alert>
    );
  }

  return (
    <Row>
      {/* TODO 1.3: Grid layout — map users into <Col md={6} lg={4} className="mb-4"> */}
      {/* TODO 1.3: Inside each <Col>, render <UserCard user={user} onUserClick={onUserClick} /> */}
      {users.map((user) => (
        <Col key={user.id} md={6} lg={4} className="mb-4">
          <UserCard user={user} onUserClick={onUserClick} />
        </Col>
      ))}
    </Row>
  );
}

export default UserList;