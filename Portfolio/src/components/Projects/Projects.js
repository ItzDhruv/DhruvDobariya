import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import springboot from "../../Assets/Projects/springboot.png";

import transaction from "../../Assets/Projects/transaction.png";
import dhulai from "../../Assets/Projects/dhulai.png";
import blogDapp from "../../Assets/Projects/blogDapp.png";
import dsa from "../../Assets/Projects/dsa.png";
import docs from "../../Assets/Projects/docs.png"
import cryptosetu from "../../Assets/Projects/crptosetu.png";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
           <Col md={4} className="project-card">
            <ProjectCard
              imgPath={cryptosetu}
              isBlog={false}
              title="Crypto Setu"
              description="A decentralized multi-utility dApp enabling users to buy the native CS token, stake assets, purchase NFTs, and swap or trade tokens seamlessly. Designed for accessibility and transparency, it delivers an all-in-one Web3 experience with secure on-chain interactions."
              ghLink="https://github.com/ItzDhruv/CryptoSetu.git"
              demoLink="https://crypto-setu.vercel.app/"              
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={dhulai}
              isBlog={false}
              title="DhulAi"
              description="A decentralized personal chat bot for secure and private conversations, built using React.js, blockchain, and AI technologies. Features real-time messaging, encrypted communication, and AI-powered responses while ensuring user privacy and decentralization."
              ghLink="https://github.com/ItzDhruv/DhulaAi-ChatBot.git"
              demoLink="https://ai-chat-bot-blond-three.vercel.app/"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={blogDapp}
              isBlog={false}
              title="Blog-Dapp-Soalna"
              description="A decentralized blogging platform on Solana, built with the Anchor framework. Users can create, like, and manage blog posts with secure on-chain storage, ensuring transparency, ownership, and censorship resistance."
              ghLink="https://github.com/ItzDhruv/Solana-Blog-Dapp.git"
              demoLink="https://solana-blog-dapp-ten.vercel.app/"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={transaction}
              isBlog={false}
              title="Royal casino"
              description="A web-based crypto casino frontend built with Next.js, offering interactive games like roulette and mines with a sleek, responsive UI. Designed for entertainment, it simulates betting logic and user interactions, ready for future blockchain integration."
              ghLink="https://github.com/ItzDhruv/Royal-Casino.git"
              demoLink="https://royal-casino.vercel.app/"              
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={docs}
              isBlog={false}
              title="Docs-Saver"
              description=" Is a modern document management web application built with React, Tailwind CSS, and Vite. It features an interactive card-based UI, allowing users to drag and drop files, edit descriptions, and manage file uploads and downloads seamlessly. The app also includes a tagging system and a responsive design for smooth usability across devices."
              ghLink="https://github.com/ItzDhruv/Docs-copy-React-App.git"
              demoLink="https://docs-copy-react-app-fcol.vercel.app/"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={springboot}
              isBlog={false}
              title="Product-Backend-SpringBoot"
              description="A Sales Campaign Management System built with Spring Boot, enabling efficient product management and campaign tracking. It supports adding, retrieving, and paginating product data, managing past, current, and upcoming sales campaigns, and automating discounts using scheduled tasks. The system also maintains a detailed price history for transparency. This project showcases expertise in backend development, RESTful API design, and scheduling with cron jobs to streamline sales operations."
              ghLink="https://github.com/ItzDhruv/Sale-Campaign-Management-System.git"
              
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={dsa}
              isBlog={false}
              title="My DSA Journey with Java"
              description="This Repository featuring a well-organized collection of problem-solving resources, including ArrayList, HashSet, Heap, Recursion, Sorting, Linked List, Trees, OOPS, and LeetCode Questions. This repository serves as a structured guide for mastering DSA concepts with categorized solutions, debugging insights, and essential coding patterns."
              ghLink="https://github.com/ItzDhruv/DSA-.git"
              
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
