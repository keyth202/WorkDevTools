export const loginApi = async(email:string, password:string)=>{
    return new Promise((resolve, reject)=>{
        setTimeout(() => {
            if (email === 'test@example.com' && password === 'password') {
              // Simulating a successful login response
              resolve({
                token: 'fake-jwt-token',
                user: {
                  name: 'Test User',
                  email: 'test@example.com',
                },
              });
            } else {
              reject('Invalid email or password');
            }
          }, 1000);
    })
}