# 📱 Social Media Platform  

> A **full-featured Social Media platform** built with **Spring Boot + React.js** 🌐🚀  

*(Built with ❤️ by Mustafa Abdelrahman)*  

🔗 **Demo Video:** [Watch on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7363275642206904321/)  

---

## ✨ Features Overview  

### 🔐 Authentication & Users  
- 👤 User registration & login (**Spring Security + JWT**)  
- ✏️ Update user profile (name, image, cover, city)  
- ❌ Delete user account  
- 📑 Get all users with **pagination**  
- 👥 Follow / unfollow other users  
- 🌟 Suggested users feature  
- 🔢 Count followers & followings  
- 📄 View all followers and followings  

---

### 📝 Posts  
- ➕ Create, update, delete posts (text + images)  
- 📄 View single or all posts (with pagination)  
- 👍 Like / Unlike posts  
- 📑 View posts by a specific user  
- 🔢 Like count updates  

---

### 💬 Comments & Replies  
- ✍️ Add comments on posts  
- ↩️ Add replies to comments  
- ❌ Delete comments and replies  
- 👍 Like / Unlike comments  
- ❤️ Like / Unlike replies  
- 📄 Fetch all comments for a post  
- 📑 Fetch all replies for a comment  

---

### 📖 Stories (Instagram/Facebook style)  
- ➕ Create a story (image/video)  
- ⏳ Stories auto-expire after 24 hours  
- 📄 Get all active stories  
- ❌ Delete story manually  
- 🕒 Automatic cleanup of expired stories (runs hourly)  

---

### 🔔 Notifications  
- Triggered by:  
  - 👍 Post likes  
  - 💬 Comment likes  
  - ↩️ Reply likes  
  - ✍️ New comments  
  - 💭 New replies  
  - 👥 New followers  
- 📄 Fetch all notifications (paginated)  
- 🔢 Count unread notifications  
- ✅ Mark one or all as read  
- ❌ Delete notification  

---

### 🎨 Frontend Tech  
- ⚡ React Query (@tanstack/react-query) → caching, auto-refetch, pagination  
- 🌐 Axios → API calls to Spring Boot backend  
- 📝 React Hot Toast → alerts for success/error messages  
- 🎭 Lucide React → modern UI icons  
- 🕒 Moment.js → formatting post/story times (“2 hours ago”)  
- 🎨 SCSS (Sass) → responsive and themable styling  

---

## 🛠️ Tech Stack  

**Backend (Spring Boot)**  
- Spring Security + JWT  
- Spring Data JPA  
- PostgreSQL  
- Lombok  

**Frontend (React.js)**  
- React + SCSS  
- React Query (@tanstack/react-query)  
- Axios  
- React Hot Toast  
- Lucide Icons  
- Moment.js  

---

## 🚀 Getting Started  

### Backend (Spring Boot)  
```bash
# Clone repo
git clone https://github.com/your-username/socialmedia-backend.git
cd socialmedia-backend

# Configure application.yml (DB, JWT secret, Cloudinary if used)
# Run backend
./mvnw spring-boot:run
