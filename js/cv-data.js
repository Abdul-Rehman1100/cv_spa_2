window.CV_DATA = {
  profile: {
    name: "Abdul-Rehman",
    location: "Lahore, Pakistan",
    university: "Qarshi University",
    degree: "BS Computer Science (BSCS)",
    semester: "Semester 5",
    email: "abdulrehmanmujahid1100@gmail.com",
    universityEmail: "24l-0005@qu.edu.pk",
    phone: "03285515995",
    handle: "abdul-rehman1100"
  },
  destinations: [
    { id: "about", name: "About me", icon: "✦", x: 480, y: 170, portrait: { x: 300, y: 245 }, label: "About me" },
    { id: "education", name: "Education", icon: "▤", x: 220, y: 465, portrait: { x: 205, y: 665 }, label: "My education" },
    { id: "contact", name: "Contact me", icon: "◎", x: 480, y: 460, portrait: { x: 300, y: 890 }, label: "Contact me" },
    { id: "skills", name: "Skills", icon: "⌁", x: 735, y: 475, portrait: { x: 395, y: 665 }, label: "My skills" },
    { id: "goals", name: "Goals", icon: "▦", x: 360, y: 245, portrait: { x: 395, y: 375 }, label: "My goals" },
    { id: "current", name: "Current work", icon: "▣", x: 205, y: 270, portrait: { x: 205, y: 375 }, label: "Projects I’m working on" },
    { id: "work", name: "My websites", icon: "⌘", x: 790, y: 360, portrait: { x: 390, y: 515 }, label: "My websites" }
  ],
  panels: {
    about: {
      icon: "✦", category: "PLAYER PROFILE", title: "Abdul-Rehman",
      pages: [
        `<div class="profile-intro"><img class="profile-portrait" src="images/me.webp" alt="Portrait of Abdul-Rehman"><p><strong>Hey, welcome to my world.</strong><br>I’m a BSCS student at Qarshi University in Lahore, currently in Semester 5.</p></div><p>Technology excites me most when it fixes everyday frustrations. I focus on practical web projects that solve real problems, combining front-end and back-end development with problem-solving.</p><div class="detail-grid"><div class="detail-tile"><b>What drives me</b><span>Build useful technology for everyday needs</span></div><div class="detail-tile"><b>Home base</b><span>Lahore, Pakistan</span></div></div>`,
        `<p>The first weeks of a university semester can be chaotic when timetables clash. That everyday problem inspired me to build a <strong>Timetable Generator</strong>.</p><p><strong>Current semester:</strong> Web Development, Software Engineering, Computer Networks, Information Security, and Computer Architecture.</p><p><strong>Core subjects completed:</strong> OOP with Java, DSA with C++, Operating Systems, Algorithms, and Databases (SQL).</p>`
      ]
    },
    current: {
      icon: "▣", category: "IN THE PROJECT LAB", title: "Current projects",
      pages: [
        `<div class="project-summary"><span class="project-index">01</span><div><h3>PrintSafe</h3><span class="project-status"><i></i> In development</span></div></div><p>Different file tools can leave users unsure where their uploads go and what hidden information a file may contain. I’m exploring a browser-based approach focused on private file handling, with local processing as a project goal—not a claim that every operation is already complete.</p><div class="tag-list"><span class="tag">Privacy</span><span class="tag">Web development</span></div>`,
        `<div class="project-summary"><span class="project-index">02</span><div><h3>Timetable Generator</h3><span class="project-status"><i></i> In development</span></div></div><p>Inspired by timetable clashes at university, this project aims to organize departments, subjects, teachers, and rooms into clash-free schedules.</p><div class="tag-list"><span class="tag">HTML</span><span class="tag">CSS</span><span class="tag">JavaScript</span></div>`,
        `<div class="project-summary"><span class="project-index">03</span><div><h3>Course Management System</h3><span class="project-status project-status-complete"><i></i> Built with Java Swing</span></div></div><p>A desktop course-management project made using Java Swing.</p><div class="tag-list"><span class="tag">Java</span><span class="tag">Java Swing</span></div>`,
        `<div class="project-summary"><span class="project-index">04</span><div><h3>Tic-Tac-Toe Bot</h3><span class="project-status project-status-complete"><i></i> Dynamic boards up to 5×5</span></div></div><p>A bot project supporting different board sizes up to 5×5.</p><div class="tag-list"><span class="tag">C++</span><span class="tag">Algorithms</span></div>`
      ]
    },
    goals: {
      icon: "▦", category: "NEXT STEPS / PERSONAL GOALS", title: "My goals",
      pages: [
        `<p>I’m drawn to technology that makes everyday tasks less frustrating. That’s the idea behind my timetable and file-privacy projects: start with a real problem, then work toward a useful solution.</p><p>My longer-term direction is to keep growing as a computer science student and developer by building practical projects and strengthening my foundations.</p>`,
        `<p><strong>Learning goals I’ve set for myself:</strong></p><div class="goal-list"><div class="goal-item"><span>01</span><p>Improve my front-end toolkit with <strong>Bootstrap and Tailwind CSS</strong>.</p></div><div class="goal-item"><span>02</span><p>Keep developing my <strong>data structures and algorithms skills in C++</strong>.</p></div><div class="goal-item"><span>03</span><p>Explore how <strong>AI tools</strong> can support my work.</p></div></div><p class="profile-note">These are learning directions, not dated milestones.</p>`
      ]
    },
    skills: {
      icon: "⌁", category: "SKILLS & TOOLS", title: "My skills",
      pages: [
        `<p><strong>Things I use to build:</strong></p><div class="detail-grid"><div class="detail-tile"><b>Web & programming</b><span>HTML · CSS · JavaScript · Java · C++ · SQL</span></div><div class="detail-tile"><b>Tools & platforms</b><span>Git · GitHub · Visual Studio Code · Ubuntu Linux · Microsoft Office</span></div></div>`,
        `<p><strong>What I’m learning and strengthening:</strong></p><div class="detail-grid"><div class="detail-tile"><b>Learning now</b><span>Bootstrap · Tailwind CSS · DSA in C++ · AI tools</span></div><div class="detail-tile"><b>Core topics</b><span>OOP · Data structures · Algorithms · Operating systems · Databases</span></div></div>`
      ]
    },
    education: {
      icon: "▤", category: "ACADEMIC RECORD", title: "My education",
      pages: [
        `<div class="detail-grid"><div class="detail-tile"><b>Currently studying</b><span>BS Computer Science (BSCS)<br>Qarshi University, Lahore<br>Semester 5</span></div><div class="detail-tile"><b>Completed</b><span>12th Class<br>Unique Group of Educations</span></div><div class="detail-tile"><b>Completed</b><span>10th Class<br>Central Model High School, Lahore</span></div></div><p>No grades or completion dates supplied.</p>`
      ]
    },
    work: {
      icon: "⌘", category: "WEBSITE SHOWCASE / LIVE PREVIEWS", title: "My websites",
      pages: [
        `<div class="website-heading"><div><span class="website-label">LIVE PREVIEW / 01</span><h3>Aero Throne</h3></div><a class="website-open" href="https://aero-throne-website.vercel.app/" target="_blank" rel="noopener noreferrer">Open site ↗</a></div><div class="site-preview"><iframe src="https://aero-throne-website.vercel.app/" title="Live preview of Aero Throne website" aria-hidden="true" tabindex="-1" loading="lazy" scrolling="no" referrerpolicy="no-referrer"></iframe></div><p class="preview-note">If the preview is blocked, open the site in a new tab.</p>`,
        `<div class="website-heading"><div><span class="website-label">LIVE PREVIEW / 02</span><h3>Campus Cafe</h3></div><a class="website-open" href="https://cit331-lab4-campus-cafe-eta.vercel.app/" target="_blank" rel="noopener noreferrer">Open site ↗</a></div><div class="site-preview"><iframe src="https://cit331-lab4-campus-cafe-eta.vercel.app/" title="Live preview of Campus Cafe website" aria-hidden="true" tabindex="-1" loading="lazy" scrolling="no" referrerpolicy="no-referrer"></iframe></div><p class="preview-note">CIT331 Lab 4 · If the preview is blocked, open the site in a new tab.</p>`,
        `<div class="website-heading"><div><span class="website-label">LIVE PREVIEW / 03</span><h3>Web Launch</h3></div><a class="website-open" href="https://web-launch-gules.vercel.app/" target="_blank" rel="noopener noreferrer">Open site ↗</a></div><div class="site-preview"><iframe src="https://web-launch-gules.vercel.app/" title="Live preview of Web Launch website" aria-hidden="true" tabindex="-1" loading="lazy" scrolling="no" referrerpolicy="no-referrer"></iframe></div><p class="preview-note">If the preview is blocked, open the site in a new tab.</p>`
      ]
    },
    contact: {
      icon: "◎", category: "OPEN CHANNEL / CONTACT", title: "Contact me",
      pages: [
        `<p class="contact-intro">Have an internship, freelance project, or collaboration in mind? Send me a note.</p><form class="contact-form" id="contact-form"><div class="form-field"><label for="contact-name">Your name</label><input id="contact-name" name="name" autocomplete="name" maxlength="80" placeholder="How should I address you?" required></div><div class="form-field"><label for="contact-email">Your email</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com" required></div><div class="form-field form-message"><label for="contact-message">Your message</label><textarea id="contact-message" name="message" rows="3" maxlength="1200" placeholder="Tell me a little about it..." required></textarea></div><button class="send-button" type="submit">OPEN EMAIL DRAFT <span aria-hidden="true">↗</span></button><p class="form-note">Your message stays on your device. This opens your email app to send it.</p></form><p class="contact-fallback">Prefer email? <a href="mailto:abdulrehmanmujahid1100@gmail.com">abdulrehmanmujahid1100@gmail.com</a></p>`,
        `<p><strong>Phone</strong><br><a href="tel:03285515995">03285515995</a></p><div class="detail-grid"><div class="detail-tile"><b>Location</b><span>Lahore, Pakistan</span></div><div class="detail-tile"><b>GitHub / portfolio handle</b><span>abdul-rehman1100</span></div></div><p>The handle is shown as supplied; no unverified profile URL is linked.</p>`
      ]
    }
  }
};
