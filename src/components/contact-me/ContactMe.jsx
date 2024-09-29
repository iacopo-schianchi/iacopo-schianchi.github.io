import React from 'react';
import './ContactMe.css';
import LinkedInIcon from '../../assets/LinkedInIcon';
import GitHubIcon from '../../assets/GitHubIcon';
import PhoneIcon from '../../assets/PhoneIcon';
import Glow from '../Glow';

export default function ContactMe() {
  return (
    <>
      <div className="contact-me" id="contact-me">
        <div className="separator">
          <div className="links">
            <a
              href="https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=iacopo.schianchi@gmail.com"
              target="_blank"
              className="email link"
            >
              iacopo.schianchi@gmail.com
            </a>
            <div className="link-grid">
              <a
                href="https://www.linkedin.com/in/iacopo-schianchi-1a063a29a/"
                target="_blank"
                className="link grid-link"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
              <a className="grid-link">
                <PhoneIcon />
                +1 (540) 323-8651
              </a>
              <a
                href="https://github.com/iacopo-schianchi"
                target="_blank"
                className="link grid-link"
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          </div>
          <h1>Get in touch</h1>
        </div>
      </div>
      <Glow />
    </>
  );
}
