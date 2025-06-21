import React from 'react';
import './About.css';

const About = () => {
  return (
    <section className="about-section container my-4">
      <h1>About iNotebookPro</h1>

      <p>
        <strong>iNotebookPro</strong> is a full-stack web application developed using the <strong>MERN stack</strong> —
        <strong>MongoDB</strong>, <strong>Express.js</strong>, <strong>React.js</strong>, and <strong>Node.js</strong>.
        It allows users to create, edit, and manage personal notes with secure authentication, offering a seamless and productive note-taking experience.
      </p>

      <h2>💡 Project Objective</h2>
      <p>
        The main goal of this project is to provide users with a secure and user-friendly platform to manage their notes online. 
        It also demonstrates the real-world implementation of a complete MERN-based application with authentication, CRUD operations, and deployment.
      </p>

      <h2>🧩 Tech Stack</h2>
      <ul>
        <li><strong>Frontend:</strong> React.js (with Hooks & Context API)</li>
        <li><strong>Backend:</strong> Node.js with Express.js</li>
        <li><strong>Database:</strong> MongoDB with Mongoose ODM</li>
        <li><strong>Authentication:</strong> JSON Web Token (JWT)</li>
        <li><strong>API Handling:</strong> Axios for HTTP requests</li>
        <li><strong>Routing:</strong> React Router DOM (client-side), Express Router (server-side)</li>
        <li><strong>Deployment:</strong> Netlify/Vercel (frontend), Render/Heroku (backend), MongoDB Atlas/Compass (database)</li>
      </ul>

      <h2>👨‍💻 Developer</h2>
      <p>
        <strong>Angel Samuel</strong> is a passionate and dedicated B.Tech Computer Science Engineering student at 
        <strong> Invertis University</strong>. He is enthusiastic about building impactful, real-world software using the power of full stack web development and AI/ML technologies.
      </p>

      <p>
        Angel has developed various web-based applications, including:
      </p>
      <ul>
        <li><strong>AngelManager</strong> – A smart task management tool</li>
        <li><strong>CodeWithAngel Blog</strong> – A developer blog website</li>
        <li><strong>AngelMart</strong> – An eCommerce-style platform</li>
        <li><strong>AngelCargo</strong> – A logistics-based tracking system</li>
        <li><strong>TayyariExpress</strong> – A study resources and exam prep platform</li>
      </ul>

      <p>
        With a long-term vision of becoming a tech leader in AI-driven solutions, Angel continues to build innovative digital tools 
        and contribute to the developer community through projects, open-source work, and educational content.
      </p>

      <h2>📌 Key Features</h2>
      <ul>
        <li>User authentication using JWT (Signup/Login)</li>
        <li>Create, read, update, and delete (CRUD) notes</li>
        <li>Responsive and clean UI using React</li>
        <li>Seamless frontend-backend integration</li>
        <li>Token-based secured user routes and APIs</li>
      </ul>

      <h2>📬 Connect with Me</h2>
      <ul>
        <li>🌐 Portfolio: <a href="https://angelsamuelportfolio.netlify.app/" target="_blank" rel="noreferrer">angelsamuelportfolio.netlify.app</a></li>
        <li>💼 LinkedIn: <a href="https://www.linkedin.com/in/angelsamuel21" target="_blank" rel="noreferrer">linkedin.com/in/angelsamuel21</a></li>
        <li>📧 Email: <a href="mailto:codewithangel@gmail.com">codewithangel@gmail.com</a></li>
      </ul>

      <h2>🛠 Future Enhancements</h2>
      <ul>
        <li>Rich text formatting support</li>
        <li>Dark mode toggle</li>
        <li>Note categories and tagging system</li>
        <li>Search and filter functionality</li>
        <li>Offline support via PWA integration</li>
      </ul>

      <p style={{ marginTop: '2rem' }}>
        <strong>Thank you for using iNotebookPro!</strong> — built with ❤️ using the MERN Stack by Angel Samuel.
      </p>
    </section>
  );
};

export default About;
