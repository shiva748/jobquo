import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";
import { io } from "socket.io-client";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  const { isLoading, error, data: initialConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  const [conversations, setConversations] = useState(initialConversations || []);

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  // Socket.io integration
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io("http://localhost:8800"); // Update this URL as needed
    setSocket(newSocket);

    // Use the _id from currentUser as the unique token
    const userId = currentUser._id;
    newSocket.emit("register", userId);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser._id]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("receive_message", (newMessage) => {
        console.log(`Message from ${newMessage.from}: ${newMessage.message}`);

        // Map the new message to the existing conversations
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conversation) => {
            // If the conversation matches the sender and receiver, update it
            if (
              (conversation.sellerId === newMessage.sellerId &&
                conversation.buyerId === newMessage.buyerId) ||
              (conversation.buyerId === newMessage.sellerId &&
                conversation.sellerId === newMessage.buyerId)
            ) {
              return {
                ...conversation,
                lastMessage: newMessage.message, // Update lastMessage
                updatedAt: new Date(), // Update timestamp
                readBySeller: false, // Set read status based on your logic
                readByBuyer: false,
              };
            }
            return conversation; // Return unchanged conversation
          });

          // If no existing conversation found, add a new one
          if (!updatedConversations.some(c => c.id === newMessage.id)) {
            updatedConversations.push({
              _id: newMessage._id,
              id: newMessage.id,
              sellerId: newMessage.sellerId,
              buyerId: newMessage.buyerId,
              readBySeller: false,
              readByBuyer: false,
              createdAt: newMessage.createdAt,
              updatedAt: newMessage.updatedAt,
              lastMessage: newMessage.message,
            });
          }

          return updatedConversations; // Return updated conversations
        });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (initialConversations) {
      setConversations(initialConversations);
    }
  }, [initialConversations]);

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr
                  className={
                    ((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) &&
                    "active"
                  }
                  key={c.id}
                >
                  <td>{currentUser.isSeller ? c.buyerId : c.sellerId}</td>
                  <td>
                    <Link to={`/message/${c.id}`} className="link">
                      {c?.lastMessage?.substring(0, 100)}...
                    </Link>
                  </td>
                  <td>{moment(c.updatedAt).fromNow()}</td>
                  <td>
                    {((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) && (
                      <button onClick={() => handleRead(c.id)}>
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;
