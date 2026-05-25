import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple"> DHRUV DOBARIYA</span> { " "}
            from <span className="purple"> GUJARAT, INDIA.</span>
            <br />
            I am currently employed as a software developer at TestGrid.
            <br />
            I specialize in building secure, scalable, and high-performance software applications, with experience in backend development, APIs, and modern web technologies. I also have additional expertise in blockchain development, including smart contracts and decentralized systems.            <br />
            <br />
            Apart from coding, some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Playing Games
            </li>
            <li className="about-activity">
              <ImPointRight /> Writing Tech Blogs
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling
            </li>
          </ul>

          <p style={{ color: "		#FFFF00" }}>
            "If it’s easy, everyone can do it."{" "}
          </p>
          <footer className="blockquote-footer" >Dhruv</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
