"use client";

import React, { useState } from "react";
import { UpsertWine } from "@/components/UpsertWine";

export function Nav() {
  const [navIsOpened, setNavIsOpened] = useState(false);

  function toggleNav() {
    setNavIsOpened(!navIsOpened);
  }

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item title has-text-primary mb-0" href="/">
            Cavavin
          </a>

          <a
            role="button"
            className={`navbar-burger ${navIsOpened ? "is-active" : ""}`}
            aria-label="menu"
            aria-expanded="false"
            data-target="brandNavbar"
            onClick={toggleNav}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div
          id="brandNavbar"
          className={`navbar-menu ${navIsOpened ? "is-active" : ""}`}
        >
          <div className="navbar-end">
            <div className="navbar-item">
              <UpsertWine
                onSubmit={() => {
                  window.location.reload();
                  return Promise.resolve();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
