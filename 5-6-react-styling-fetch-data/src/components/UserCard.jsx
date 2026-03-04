import React from "react";
import { Card, Button } from "react-bootstrap";

function UserCard({ user, onUserClick }) {
  return (
    <Card className="user-card">
      <Card.Body>
        <div className="user-avatar">{user.name.charAt(0)}</div>

        <Card.Title className="mt-3">{user.name}</Card.Title>
        <Card.Text>
          <strong>Username:</strong> {user.username}
          <br />
          <strong>Email:</strong> {user.email}
          <br />
          <strong>Phone:</strong> {user.phone}
        </Card.Text>

        {/* TODO 3.1: Add ONE <Button> here (text: "View Details") */}
        {/* TODO 3.1: onClick MUST call onUserClick and pass the current user object */}
        <Button onClick={() => onUserClick(user)}>View Details</Button>
      </Card.Body>
    </Card>
  );
}

export default UserCard;