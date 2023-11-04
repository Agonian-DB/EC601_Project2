// TravelAdvisorDialog.js

import React, { useState } from 'react';
import { Drawer, TextField, Button, List, ListItem, Typography } from '@material-ui/core';
import axios from 'axios';

const TravelAdvisorDialog = (props) => {
  const { onPlaceNameUpdate } = props;
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/ask', {
        message: query,
      });
      // const newPlaceName = 'new york';
      // onPlaceNameUpdate(newPlaceName);
      if (data.place_names && data.place_names.length > 0) {
        onPlaceNameUpdate(data.place_names);
      } // update place names
      // 将用户的消息和聊天助手的回复都添加到responses
      if (typeof data === 'string') {
        // 直接显示字符串作为机器人的消息
        setResponses((prevResponses) => [
          ...prevResponses,
          { type: 'user', text: query },
          { type: 'bot', text: data },
        ]);
      } else if (data.user_message && data.assistant_message) {
        // 显示用户和机器人的消息
        setResponses((prevResponses) => [
          ...prevResponses,
          { type: 'user', text: data.user_message },
          { type: 'bot', text: data.assistant_message },
        ]);
      } else {
        console.error('Unexpected response format:', data);
        setResponses([{ type: 'bot', text: 'Error getting response.' }]);
      }
    } catch (error) {
      console.error('Error asking OpenAI:', error);
      setResponses([{ type: 'bot', text: 'Error getting response.' }]);
    }
    setLoading(false);
  };

  return (
    <Drawer variant="permanent" anchor="bottom">
      <List>
        {responses.map((message, index) => (
          <ListItem key={index}>
            <Typography color={message.type === 'user' ? 'primary' : 'secondary'}>
              {message.text}
            </Typography>
          </ListItem>
        ))}
      </List>
      <div style={{ display: 'flex', padding: '1rem' }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          label="Ask for recommendations"
        />
        <Button onClick={handleQuerySubmit} style={{ marginLeft: '1rem' }}>
          Submit
        </Button>
        {loading && <p>Loading...</p>}  {/* 这里显示加载指示符 */}
      </div>
    </Drawer>
  );
};

export default TravelAdvisorDialog;

