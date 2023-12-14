import React from "react";
import './style.css';

function Intro() {
    return(
    <>
    <header role="banner" className="ui-section-header">
      <div class="ui-layout-container">
        <div class="ui-section-header__layout ui-layout-flex">
            <img src="squadreel.png" class="responsive" alt="logo"></img>
        </div>
      </div>
    </header>
    <main role="main">
      <section class="ui-section-hero">
        <div class="ui-layout-container">
            <div id="home" class="ui-layout-column-6 ui-layout-column-center">
                <h1 style={{ fontFamily: 'Unica One' }}><b>SQUAD</b><i>REEL</i></h1>
                <p class="ui-text-intro">Your online portal to team film.</p>
                <p class="ui-text-intro"><b>Click</b> on your team below to get started:</p>
                <div class="ui-component-cta ui-layout-flex">
                    <a href="/wchsws" role="link" aria-label="#" class="ui-component-button ui-component-button-normal ui-component-button-primary">West Campus Women's Soccer</a>
                    <p class="ui-text-note"><small> Don't see your team? Get in touch below.</small></p>
                </div>
            </div>
        </div>
    </section>
    </main>
    <footer role="contentinfo" class="ui-section-footer">
      <div class="ui-layout-container">
        <div class="ui-section-footer__layout ui-layout-flex">
          <p class="ui-section-footer--copyright ui-text-note"><small>&copy; 2023 Kenavoga</small></p>
          <a href="mailto: contact@squadreel.com" role="link" aria-label="#" class="ui-text-note"><small>Contact us</small></a>
        </div>
      </div>
    </footer>
    </>
    )
}

export default Intro;