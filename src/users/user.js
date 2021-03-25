const users = [];
export const getUser = (id) => {
  return users.find((user) => user.id === id);
};
export const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const isUser = users.find(
    (user) => user.username === username && user.room === room
  );
  if (isUser) return { error: "username is already taken" };
  const user = {
    username,
    room,
    id,
  };
  users.push(user);
  return { user };
};

export const removeUser = function (id) {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    return { user: users.splice(userIndex, 1)[0] };
  }
};

export const getUsersInRoom = function (room) {
  const usersInRoom = users.filter((user) => user.room === room);
  return { users: usersInRoom };
};


