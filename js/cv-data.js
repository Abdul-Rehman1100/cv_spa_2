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
    { id: "about", name: "Welcome Plaza", icon: "✦", x: 480, y: 170, portrait: { x: 300, y: 245 }, label: "About Abdul-Rehman" },
    { id: "printsafe", name: "PrintSafe Terminal", icon: "▣", x: 205, y: 270, portrait: { x: 205, y: 375 }, label: "PrintSafe" },
    { id: "timetable", name: "Schedule Station", icon: "▦", x: 360, y: 245, portrait: { x: 395, y: 375 }, label: "Timetable Generator" },
    { id: "course", name: "Course Console", icon: "⌘", x: 665, y: 255, portrait: { x: 205, y: 515 }, label: "Course Management System" },
    { id: "tictactoe", name: "Bot Arcade", icon: "⊞", x: 790, y: 360, portrait: { x: 390, y: 515 }, label: "Tic-Tac-Toe Bot" },
    { id: "skills", name: "Skills Workshop", icon: "⌁", x: 735, y: 475, portrait: { x: 395, y: 665 }, label: "Skills & tools" },
    { id: "education", name: "Study Corner", icon: "▤", x: 220, y: 465, portrait: { x: 205, y: 665 }, label: "Education" },
    { id: "contact", name: "Contact Portal", icon: "◎", x: 480, y: 510, portrait: { x: 300, y: 845 }, label: "Contact Abdul-Rehman" }
  ],
  panels: {
    about: {
      icon: "✦", category: "PLAYER PROFILE", title: "Abdul-Rehman",
      pages: [
        `<p>Technology excites me most when it fixes everyday frustrations. I’m a <strong>BS Computer Science student at Qarshi University, Lahore</strong>, currently in Semester 5.</p><p>I focus on practical web projects that solve real problems, combining front-end and back-end development with problem-solving.</p><div class="detail-grid"><div class="detail-tile"><b>Current quest</b><span>Build useful technology for everyday needs</span></div><div class="detail-tile"><b>Based in</b><span>Lahore, Pakistan</span></div></div>`,
        `<p>The first weeks of a university semester can be chaotic when timetables clash. That everyday problem inspired me to build a <strong>Timetable Generator</strong>.</p><p><strong>Current semester:</strong> Web Development, Software Engineering, Computer Networks, Information Security, and Computer Architecture.</p><p><strong>Core subjects completed:</strong> OOP with Java, DSA with C++, Operating Systems, Algorithms, and Databases (SQL).</p>`
      ]
    },
    printsafe: {
      icon: "▣", category: "PROJECT / WEB DEVELOPMENT", title: "PrintSafe",
      pages: [
        `<p>People often use separate tools to compress, merge, or convert files without knowing where their uploads go or what hidden information the output may contain. That trust gap inspired this project.</p><p>PrintSafe is planned as a browser-based platform for <strong>private, efficient, and secure file handling</strong>, with the goal of processing sensitive files locally on a user's device.</p><div class="status-line"><span class="status-dot"></span> IN DEVELOPMENT</div>`,
        `<p>The project aims to reduce risky uploads and concerns about hidden metadata. Local processing is an intended direction; the complete product and all file operations are <strong>not being presented as finished</strong>.</p><div class="tag-list"><span class="tag">Web development</span><span class="tag">Privacy</span><span class="tag">File handling</span></div>`
      ]
    },
    timetable: {
      icon: "▦", category: "PROJECT / WEB DEVELOPMENT", title: "Timetable Generator",
      pages: [
        `<p>Semester timetables can bring a round of “clash whack-a-mole.” I’m building a tool to help organize <strong>departments, subjects, teachers, and rooms</strong> into clash-free schedules.</p><p>The idea comes from real timetable confusion during the first weeks of university semesters.</p><div class="status-line"><span class="status-dot"></span> IN DEVELOPMENT</div>`,
        `<p>This is an ongoing project; no completion claim or measured result is implied.</p><div class="tag-list"><span class="tag">HTML</span><span class="tag">CSS</span><span class="tag">JavaScript</span></div>`
      ]
    },
    course: {
      icon: "⌘", category: "PROJECT / DESKTOP APPLICATION", title: "Course Management System",
      pages: [
        `<p>A course-management project built using <strong>Java Swing</strong>.</p><p>Created as part of my hands-on experience building software with Java desktop UI tools.</p><div class="tag-list"><span class="tag">Java</span><span class="tag">Java Swing</span></div>`
      ]
    },
    tictactoe: {
      icon: "⊞", category: "PROJECT / GAME LOGIC", title: "Tic-Tac-Toe Bot",
      pages: [
        `<p>I built a Tic-Tac-Toe bot that supports <strong>dynamic board sizes up to 5×5</strong>.</p><p>A small game project exploring adaptable board logic and bot behavior.</p><div class="tag-list"><span class="tag">C++</span><span class="tag">Algorithms</span><span class="tag">Up to 5×5</span></div>`
      ]
    },
    skills: {
      icon: "⌁", category: "LOADOUT / SKILLS & TOOLS", title: "Skills Workshop",
      pages: [
        `<div class="detail-grid"><div class="detail-tile"><b>Web & programming</b><span>HTML · CSS · JavaScript · Java · C++ · SQL</span></div><div class="detail-tile"><b>Tools & platforms</b><span>Git · GitHub · Visual Studio Code · Ubuntu Linux · Microsoft Office</span></div><div class="detail-tile"><b>Learning now</b><span>Bootstrap · Tailwind CSS · DSA in C++ · AI tools</span></div><div class="detail-tile"><b>Core topics</b><span>OOP · Data structures · Algorithms · Operating systems · Databases</span></div></div>`
      ]
    },
    education: {
      icon: "▤", category: "ACADEMIC RECORD", title: "Study Corner",
      pages: [
        `<div class="detail-grid"><div class="detail-tile"><b>Currently studying</b><span>BS Computer Science (BSCS)<br>Qarshi University, Lahore<br>Semester 5</span></div><div class="detail-tile"><b>Completed</b><span>12th Class<br>Unique Group of Educations</span></div><div class="detail-tile"><b>Completed</b><span>10th Class<br>Central Model High School, Lahore</span></div></div><p>No grades or completion dates supplied.</p>`
      ]
    },
    contact: {
      icon: "◎", category: "OPEN CHANNEL / CONTACT", title: "Let's connect",
      pages: [
        `<p>For internships, freelance web projects, or collaboration:</p><p><strong>Professional email</strong><br><a href="mailto:abdulrehmanmujahid1100@gmail.com">abdulrehmanmujahid1100@gmail.com</a></p><p><strong>University email</strong><br><a href="mailto:24l-0005@qu.edu.pk">24l-0005@qu.edu.pk</a></p>`,
        `<p><strong>Phone</strong><br><a href="tel:03285515995">03285515995</a></p><div class="detail-grid"><div class="detail-tile"><b>Location</b><span>Lahore, Pakistan</span></div><div class="detail-tile"><b>GitHub / portfolio handle</b><span>abdul-rehman1100</span></div></div><p>The handle is shown as supplied; no unverified profile URL is linked.</p>`
      ]
    }
  }
};
