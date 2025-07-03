// Demo user data for testing
export const createDemoUsers = () => {
  const demoUsers = [
    {
      id: 'demo1',
      name: 'Cao Tiến',
      email: 'admin@gmail.com',
      password: '123456',
      avatar: 'https://ui-avatars.com/api/?name=Cao+Tien&background=1DB954&color=000000',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo2', 
      name: 'Nguyễn Văn A',
      email: 'user@gmail.com',
      password: '123456',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=1DB954&color=000000',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo3',
      name: 'Trần Thị B',
      email: 'demo@gmail.com', 
      password: '123456',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=1DB954&color=000000',
      createdAt: new Date().toISOString()
    }
  ];

  // Check if demo users already exist
  const existingUsers = JSON.parse(localStorage.getItem('spotifyCloneUsers') || '[]');
  
  // Only add demo users if none exist
  if (existingUsers.length === 0) {
    localStorage.setItem('spotifyCloneUsers', JSON.stringify(demoUsers));
    console.log('Demo users created:', demoUsers.map(u => ({ email: u.email, password: u.password })));
  }
};

// Call this function when app loads
if (typeof window !== 'undefined') {
  createDemoUsers();
} 