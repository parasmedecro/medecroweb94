'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaUserCircle } from 'react-icons/fa'; // Import the icons

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi there! I'm your AI Medical Support Assistant. How may I help you today?`
  }]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for auto-scrolling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom whenever messages change
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) {
      console.log('Message is empty or contains only whitespace');
      return;
    }

    const userMessage = { role: "user", content: message };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: '' }, // Placeholder for assistant's response
    ]);

    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        console.error('Error sending message:', response.status);
        return;
      }

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.response }; // Extract the response value
      
      // Update the message with bot response
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = botMessage; // Replace the empty placeholder
        return newMessages;
      });

    } catch (error) {
      console.error('Error processing response:', error);
    }
  };

  // Explicitly type the event parameter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default action (e.g., adding a new line)
      sendMessage(); // Call the sendMessage function
    }
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {
            messages.map((msg, index) => (
              msg.content.trim() && (
                <Box 
                  key={index} 
                  display='flex' 
                  alignItems="center"
                  justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
                >
                  {msg.role === 'assistant' ? (
                    <FaRobot size={24} style={{ marginRight: '8px' }} /> // Bot icon
                  ) : (
                    <FaUserCircle size={24} style={{ marginRight: '8px' }} /> // User icon
                  )}
                  <Box
                    bgcolor={msg.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                    color="white"
                    borderRadius={16}
                    p={3}
                  >
                    {/* Use ReactMarkdown to render formatted content */}
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                </Box>
              )
            ))
          }
          {/* This div is used for auto-scrolling */}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown} // Add onKeyDown event handler
            InputProps={{
              style: { color: 'white' } // Text color in the message box
            }}
            InputLabelProps={{
              style: { color: 'white' } // Label color for better visibility
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', // Border color
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Border color when hovering
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Border color when focused
                },
              },
            }}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
