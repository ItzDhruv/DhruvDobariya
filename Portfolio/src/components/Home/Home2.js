import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/dhruv.png";
import Tilt from "react-parallax-tilt";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiFillInstagram,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";

function Home2() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        {/* <Row>
          <Col md={8} className="home-about-description">
            <h1 style={{ fontSize: "2.6em" }}>
              LET ME <span className="purple"> INTRODUCE </span> MYSELF
            </h1>
            <p className="home-about-body">
              I fell in love with programming and I have at least learnt
              something, I think… 🤷‍♂️
              <br />
              <br />I am fluent in classics like
              <i>
                <b className="purple"> Solidity, Java, Rust and JavaScript. </b>
              </i>
              <br />
              <br />
              My field of Interest's are building new &nbsp;
              <i>
                <b className="purple">Web Technologies and Products </b> 
                 in areas related to{" "}
                <b className="purple">
                  Blockchain.
                </b>
              </i>
              <br />
              <br />
              Whenever I have free time, I love contributing to the blockchain space by  
              uploading my <b className="purple">hackathon projects</b> and exploring  
              innovative solutions in
              <i>
                <b className="purple">
                  {" "}
                  BLokchain development
                </b>
                </i>
            </p>
          </Col>
          <Col md={4} className="myAvtar">
            <Tilt>
             <img
  src={myImg}
  alt="avatar"
  style={{
    height: "200px",
    width: "200px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    margin: "0 auto",
  }}
/>

            </Tilt>
          </Col>
        </Row> */}
        <Row>
  <Col md={8} className="home-about-description">
    <h1 style={{ fontSize: "2.6em" }}>
      LET ME <span className="purple"> INTRODUCE </span> MYSELF
    </h1>

    <p className="home-about-body">
      I am a Software Developer with around 2+ years of experience building
      scalable backend systems and modern web applications.
      <br />
      <br />
      I primarily work with
      <i>
        <b className="purple">
          {" "}
          Java, Spring Boot, JavaScript, React, and REST APIs.
        </b>
      </i>
      <br />
      <br />
      My main focus is developing
      <i>
        <b className="purple">
          {" "}
          secure, high-performance backend applications
        </b>
      </i>
      , along with creating responsive and user-friendly web solutions.
      <br />
      <br />
      Additionally, I have experience in
      <i>
        <b className="purple">
          {" "}
          Blockchain Development
        </b>
      </i>
      , including smart contracts, Web3 applications, and decentralized systems.
      <br />
      <br />
      I also enjoy contributing to open-source projects, participating in
      hackathons, and continuously learning new technologies to improve my
      development skills.
    </p>
  </Col>

  <Col md={4} className="myAvtar">
    <Tilt>
      <img
        src={myImg}
        alt="avatar"
        style={{
          height: "200px",
          width: "200px",
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          margin: "0 auto",
        }}
      />
    </Tilt>
  </Col>
</Row>
        <Row>
          <Col md={12} className="home-about-social">
            <h1>FIND ME ON</h1>
            <p>
              Feel free to <span className="purple">connect </span>with me
            </p>
            <ul className="home-about-social-links">
              <li className="social-icons">
                <a
                  href="https://github.com/ItzDhruv"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillGithub />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://x.com/__DHRUV__20"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiOutlineTwitter />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.linkedin.com/in/dhruv-dobariya/"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <FaLinkedinIn />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.instagram.com/dhruv_dobariya_20"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour home-social-icons"
                >
                  <AiFillInstagram />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Home2;
