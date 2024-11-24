import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          <div className="item">
            <Link className="link" to={"/gigs?cat=design"}>
              <span>Graphics & Design</span>
            </Link>
            <Link className="link" to={"/gigs?cat=marketing"}>
              <span>Digital Marketing</span>
            </Link>
          </div>
          <div className="item">
          <Link className="link" to={"/gigs?cat=video"}>
            <span>Video & Animation</span>
            </Link>
            <Link className="link" to={"/gigs?cat=music"}>
            <span>Music & Audio</span>
            </Link>
            <Link className="link" to={"/gigs?cat=programming"}>
            <span>Programming & Tech</span>
            </Link>
          </div>
          <div className="item">
          <Link className="link" to={"/gigs?cat=data"}>
            <span>Data</span>
            </Link>
            <Link className="link" to={"/gigs?cat=business"}>
            <span>Business</span>
            </Link>
            <Link className="link" to={"/gigs?cat=lifestyle"}>
            <span>Lifestyle</span>
            </Link>
          </div>
          <div className="item">
          <Link className="link" to={"/gigs?cat=Photography"}>
            <span>Photography</span>
            </Link>
          <Link className="link" to={"/gigs?cat=web"}>
            <span>Web Development</span>
            </Link>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>JobQuo</h2>
            <span>© JobQuo International Ltd. 2023</span>
          </div>
          <div className="right">
            <img src="/img/accessibility.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
