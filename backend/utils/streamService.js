const { StreamChat } = require('stream-chat');
const { StreamVideoClient } = require('@stream-io/node-sdk');

const streamChat = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
const streamVideo = new StreamVideoClient({
  apiKey: process.env.STREAM_API_KEY,
  token: process.env.STREAM_API_SECRET,
  user: { id: 'server' }
});

// Chat Functions
const createChatToken = (userId) => {
  return streamChat.createToken(userId);
};

const createChatChannel = async (sessionId, mentorId, studentId) => {
  const channel = streamChat.channel('session', sessionId, {
    members: [mentorId, studentId],
    session_id: sessionId
  });
  
  await channel.create();
  return channel;
};

// Video Functions
const createVideoCall = async (sessionId, mentorId, studentId) => {
  const call = await streamVideo.call('default', sessionId);
  await call.getOrCreate({
    members: [{ user_id: mentorId }, { user_id: studentId }],
    custom: {
      session_id: sessionId
    }
  });
  
  return call;
};

const createVideoToken = (userId) => {
  return streamVideo.createToken(userId);
};

module.exports = {
  createChatToken,
  createChatChannel,
  createVideoCall,
  createVideoToken
}; 