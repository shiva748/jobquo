import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";
import { io } from "socket.io-client";

const Message = () => {
  const { id } = useParams(); // This is the conversation ID
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]); // State for messages
  const [socket, setSocket] = useState(null); // Socket instance

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = {
      conversationId: id,
      desc: e.target[0].value,
    };

    // Send message through socket, including recipientId
    const recipientId = currentUser.isSeller
      ? data[0]?.buyerId
      : data[0]?.sellerId; // Assuming the first message in data holds the correct recipient info
    socket.emit("send_message", {
      ...message,
      senderId: currentUser._id, // Add senderId for identification
      to: id.replace(currentUser._id, ""), // Include recipientId
      createdAt: new Date(), // Add timestamp
    });

    // Optionally, update local state immediately for better UX
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...message, userId: currentUser._id, _id: Math.random() }, // Use random ID for local state
    ]);

    mutation.mutate(message); // Also send it to the server
    e.target[0].value = ""; // Clear the input field
  };

  useEffect(() => {
    // Establish socket connection
    const newSocket = io("http://localhost:8800"); // Update this URL as needed
    setSocket(newSocket);
    const userId = currentUser._id;
    newSocket.emit("register", userId);
    // Listen for incoming messages
    newSocket.on("receive_message", (newMessage) => {
      // Update messages state with new message
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Sync messages from the query to the local state
  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link>
        </span>
        {isLoading ? (
          "loading"
        ) : error ? (
          "error"
        ) : (
          <div className="messages">
            {messages.map((m) => (
              <div
                className={m.userId === currentUser._id ? "owner item" : "item"}
                key={m._id}
              >
                <img
                  src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt=""
                />
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea type="text" placeholder="write a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
