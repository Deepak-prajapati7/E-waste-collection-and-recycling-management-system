(() => {
  "use strict";

  /* ------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------ */
  const STORE = {
    requests: "ecocycle.v2.requests",
    session: "ecocycle.v2.session",
    theme: "ecocycle-theme",
  };

  const CATEGORIES = [
    {
      name: "Computers",
      code: "PC",
      desc: "Desktops, laptops, monitors, keyboards and mice",
      note: "",
    },
    {
      name: "Mobile phones",
      code: "PH",
      desc: "Phones, tablets, chargers and accessories",
      note: "Remove SIM and memory cards",
    },
    {
      name: "Batteries",
      code: "BT",
      desc: "Rechargeable and household batteries",
      note: "Keep damaged batteries separate",
    },
    {
      name: "Televisions",
      code: "TV",
      desc: "LCD, LED, plasma and other displays",
      note: "Handle screens upright",
    },
    {
      name: "Printers",
      code: "PR",
      desc: "Printers, scanners, fax machines, ink and toner units",
      note: "",
    },
    {
      name: "Cables",
      code: "CB",
      desc: "Power cords, adapters, USB cables and other wiring",
      note: "",
    },
    {
      name: "Game consoles",
      code: "GC",
      desc: "Consoles, controllers and handheld devices",
      note: "Sign out of accounts",
    },
    {
      name: "Audio equipment",
      code: "AU",
      desc: "Speakers, headphones, radios and stereo equipment",
      note: "",
    },
    {
      name: "Cameras",
      code: "CA",
      desc: "Digital cameras, camcorders, lenses and accessories",
      note: "Remove memory cards",
    },
    {
      name: "Small appliances",
      code: "SA",
      desc: "Small electric kitchen, grooming and household appliances",
      note: "",
    },
    {
      name: "Networking equipment",
      code: "NW",
      desc: "Routers, modems, switches and network accessories",
      note: "",
    },
    {
      name: "Wearables",
      code: "WR",
      desc: "Smartwatches, fitness trackers and other electronic wearables",
      note: "Built-in batteries: do not open",
    },
    {
      name: "Lamps and lighting",
      code: "LT",
      desc: "LED lamps and electronic lighting",
      note: "Ask the point about special handling",
    },
    {
      name: "Other small electronics",
      code: "OT",
      desc: "Calculators, toys, power banks and other small devices",
      note: "Power banks: treat as batteries",
    },
  ];

  const STATUSES = [
    "Pending",
    "Approved",
    "Scheduled",
    "Collected",
    "Processing",
    "Completed",
    "Rejected",
    "Cancelled",
  ];
  const IN_PROGRESS = ["Approved", "Scheduled", "Collected", "Processing"];
  const FLOW = [
    "Pending",
    "Approved",
    "Scheduled",
    "Collected",
    "Processing",
    "Completed",
  ];
  const sKey = (s) => String(s || "").toLowerCase();

  const NAV = {
    user: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "new", label: "New request", icon: "plus" },
      { id: "requests", label: "My requests", icon: "list" },
      { id: "map", label: "Find a point", icon: "pin" },
      { id: "categories", label: "Categories", icon: "box" },
      { id: "guide", label: "Safety guide", icon: "book" },
    ],
    admin: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "requests", label: "All requests", icon: "list" },
      { id: "map", label: "Recycling points", icon: "pin" },
      { id: "guide", label: "Safety guide", icon: "book" },
    ],
  };
  const TITLES = {
    overview: "Overview",
    new: "New request",
    requests: { user: "My requests", admin: "All requests" },
    map: { user: "Find a drop-off point", admin: "Recycling points" },
    categories: "Accepted categories",
    guide: "Safety guide",
  };

  const QUICK_CITIES = [
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Ahmedabad",
  ];

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (n) =>
    `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  const addDays = (n, from = new Date()) => {
    const d = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate() + n,
      10,
      0,
      0,
    );
    return d;
  };
  const fmtDate = (iso) => {
    const d = new Date(String(iso).length <= 10 ? `${iso}T00:00:00` : iso);
    return Number.isNaN(d.getTime())
      ? String(iso || "")
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };
  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };
  const displayId = (id) => `ECO-${id}`;
  const initials = (name) =>
    String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
        return true;
      } catch {
        return false;
      }
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    },
  };

  /* ------------------------------------------------------------------
   * Seed data (sample records for the prototype)
   * ------------------------------------------------------------------ */
  function buildHistory(created, status, handler) {
    const path =
      status === "Rejected"
        ? ["Pending", "Rejected"]
        : status === "Cancelled"
          ? ["Pending", "Cancelled"]
          : FLOW.slice(0, FLOW.indexOf(status) + 1);
    const now = Date.now();
    return path.map((s, i) => {
      const at = new Date(Math.min(addDays(i, created).getTime(), now - 60000));
      return {
        status: s,
        at: at.toISOString(),
        by: i === 0 ? "Requester" : handler,
      };
    });
  }

  function seedRequests() {
    const rows = [
      [
        1001,
        "Rahul Sharma",
        "rahul@example.com",
        "Computers",
        "Pickup",
        -9,
        -2,
        "B-14, Malviya Nagar, Jaipur, Rajasthan 302017",
        "Collected",
        2,
      ],
      [
        1002,
        "Priya Verma",
        "priya@example.com",
        "Mobile phones",
        "Drop-off",
        -5,
        2,
        "Croma, Connaught Place, New Delhi",
        "Approved",
        3,
      ],
      [
        1003,
        "Amit Gupta",
        "amit@example.com",
        "Batteries",
        "Pickup",
        -6,
        0,
        "Hazratganj, Lucknow, Uttar Pradesh",
        "Scheduled",
        12,
      ],
      [
        1004,
        "Sneha Patel",
        "sneha@example.com",
        "Televisions",
        "Pickup",
        -1,
        3,
        "Satellite Road, Ahmedabad, Gujarat",
        "Pending",
        1,
      ],
      [
        1005,
        "Rohit Singh",
        "rohit@example.com",
        "Printers",
        "Pickup",
        -12,
        -6,
        "Kothrud, Pune, Maharashtra",
        "Rejected",
        1,
      ],
      [
        1006,
        "Meera Nair",
        "meera@example.com",
        "Cables",
        "Drop-off",
        -20,
        -14,
        "Edappally, Kochi, Kerala",
        "Completed",
        6,
      ],
      [
        1007,
        "Karan Mehta",
        "karan@example.com",
        "Game consoles",
        "Pickup",
        -2,
        4,
        "Andheri West, Mumbai, Maharashtra",
        "Pending",
        2,
      ],
      [
        1008,
        "Ananya Iyer",
        "ananya@example.com",
        "Networking equipment",
        "Drop-off",
        -10,
        -4,
        "Indiranagar, Bengaluru, Karnataka",
        "Processing",
        4,
      ],
      [
        1009,
        "Vikram Rao",
        "vikram@example.com",
        "Small appliances",
        "Pickup",
        -27,
        -21,
        "Banjara Hills, Hyderabad, Telangana",
        "Completed",
        3,
      ],
      [
        1010,
        "Neha Kapoor",
        "neha@example.com",
        "Wearables",
        "Drop-off",
        0,
        5,
        "Sector 17, Chandigarh",
        "Pending",
        1,
      ],
      [
        1011,
        "Sandeep Joshi",
        "sandeep@example.com",
        "Audio equipment",
        "Pickup",
        -33,
        -28,
        "Vijay Nagar, Indore, Madhya Pradesh",
        "Completed",
        2,
      ],
      [
        1012,
        "Farhan Qureshi",
        "farhan@example.com",
        "Cameras",
        "Pickup",
        -15,
        -9,
        "MP Nagar, Bhopal, Madhya Pradesh",
        "Cancelled",
        1,
      ],
      [
        1013,
        "Divya Menon",
        "divya@example.com",
        "Computers",
        "Pickup",
        -3,
        1,
        "Kowdiar, Thiruvananthapuram, Kerala",
        "Approved",
        2,
      ],
      [
        1014,
        "Arjun Bose",
        "arjun@example.com",
        "Other small electronics",
        "Drop-off",
        -40,
        -35,
        "Salt Lake, Kolkata, West Bengal",
        "Completed",
        5,
      ],
      [
        1015,
        "Rahul Sharma",
        "rahul@example.com",
        "Mobile phones",
        "Drop-off",
        -30,
        -26,
        "Gaurav Tower, Malviya Nagar, Jaipur",
        "Completed",
        2,
      ],
      [
        1016,
        "Rahul Sharma",
        "rahul@example.com",
        "Batteries",
        "Pickup",
        -1,
        3,
        "B-14, Malviya Nagar, Jaipur, Rajasthan 302017",
        "Pending",
        4,
      ],
    ];
    return rows.map(
      ([id, user, email, category, method, c, d, location, status, qty]) => {
        const created = addDays(c);
        return {
          id,
          user,
          email,
          category,
          method,
          qty,
          date: toISO(addDays(d)),
          location,
          notes: "",
          phone: "",
          status,
          createdAt: created.toISOString(),
          history: buildHistory(created, status, "Operations"),
        };
      },
    );
  }

  function loadRequests() {
    const raw = store.get(STORE.requests);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((r) => r && typeof r === "object" && "id" in r)
        )
          return parsed;
      } catch {
        /* fall through */
      }
    }
    return seedRequests();
  }

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const state = {
    user: null,
    requests: loadRequests(),
    view: "overview",
    openRequestId: null,
  };
  let saveOk = true;
  function persist() {
    saveOk = store.set(STORE.requests, JSON.stringify(state.requests));
    return saveOk;
  }
  const isAdmin = () => state.user?.role === "admin";
  const myRequests = () =>
    isAdmin()
      ? state.requests
      : state.requests.filter(
          (r) =>
            String(r.email || "").toLowerCase() ===
            state.user.email.toLowerCase(),
        );
  const findRequest = (id) =>
    state.requests.find((r) => String(r.id) === String(id));

  /* ------------------------------------------------------------------
   * Theme, toast, modal
   * ------------------------------------------------------------------ */
  function setTheme(theme) {
    const dark = theme === "dark";
    document.body.dataset.theme = dark ? "dark" : "light";
    const btn = $("themeToggle");
    btn.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
    btn.innerHTML = icon(dark ? "sun" : "moon");
    store.set(STORE.theme, dark ? "dark" : "light");
  }

  function toast(message, type = "ok") {
    const el = document.createElement("div");
    el.className = `toast${type === "error" ? " is-error" : ""}`;
    el.innerHTML = `${icon(type === "error" ? "alert" : "check")}<span>${esc(message)}</span>`;
    $("toasts").appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function confirmDialog({ title, text, confirmLabel = "Delete" }) {
    return new Promise((resolve) => {
      const modal = $("modal");
      $("modalTitle").textContent = title;
      $("modalText").textContent = text;
      $("modalOk").textContent = confirmLabel;
      modal.hidden = false;
      const previous = document.activeElement;
      $("modalCancel").focus();
      const done = (v) => {
        modal.hidden = true;
        $("modalOk").onclick = $("modalCancel").onclick = null;
        modal.onclick = null;
        document.removeEventListener("keydown", onKey, true);
        previous?.focus?.();
        resolve(v);
      };
      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          done(false);
        }
      };
      document.addEventListener("keydown", onKey, true);
      $("modalOk").onclick = () => done(true);
      $("modalCancel").onclick = () => done(false);
      modal.onclick = (e) => {
        if (e.target === modal) done(false);
      };
    });
  }

  /* ------------------------------------------------------------------
   * Auth
   * ------------------------------------------------------------------ */
  let authMode = "login";
  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("authNameField").hidden = !signup;
    $("authTitle").textContent = signup ? "Create account" : "Sign in";
    $("authDescription").textContent = signup
      ? "Set up a prototype account."
      : "Use your account to continue.";
    $("authSubmit").textContent = signup ? "Create account" : "Sign in";
    $("authPassword").autocomplete = signup
      ? "new-password"
      : "current-password";
    for (const [id, active] of [
      ["loginTab", !signup],
      ["signupTab", signup],
    ]) {
      $(id).classList.toggle("is-active", active);
      $(id).setAttribute("aria-selected", String(active));
    }
    $("authMessage").textContent = "";
  }

  function startSession(profile, remember = true) {
    state.user = profile;
    if (remember) store.set(STORE.session, JSON.stringify(profile));
    $("auth").hidden = true;
    $("app").hidden = false;
    $("avatar").textContent = initials(profile.name);
    $("topbarAvatar").textContent = initials(profile.name);
    $("topbarAvatar").title = `${profile.name} · ${profile.role === "admin" ? "Administrator" : "User"}`;
    $("accountName").textContent = profile.name;
    $("accountRole").textContent =
      profile.role === "admin" ? "Administrator" : "User";
    $("roleCaption").textContent =
      profile.role === "admin" ? "Operations" : "Collections";
    $("todayLabel").textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    buildNav();
    setupStaticControls();
    route();
  }

  function endSession() {
    store.del(STORE.session);
    state.user = null;
    closeDrawer();
    $("toasts").replaceChildren();
    $("app").hidden = true;
    $("auth").hidden = false;
    $("authForm").reset();
    setAuthMode("login");
    history.replaceState(null, "", location.pathname);
  }

  function submitAuth(e) {
    e.preventDefault();
    const email = $("authEmail").value.trim().toLowerCase();
    const password = $("authPassword").value;
    const role = $("authRole").value;
    const msg = $("authMessage");
    if (authMode === "signup" && !$("authName").value.trim()) {
      msg.textContent = "Enter your full name.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Enter a valid email address.";
      return;
    }
    if (password.length < 6) {
      msg.textContent = "Password must be at least 6 characters.";
      return;
    }
    const name =
      authMode === "signup"
        ? $("authName").value.trim()
        : email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    startSession({ name, email, role });
  }

  /* ------------------------------------------------------------------
   * Navigation & routing
   * ------------------------------------------------------------------ */
  function buildNav() {
    const items = NAV[state.user.role];
    $("nav").innerHTML = items
      .map(
        (n) =>
          `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span><span class="badge" data-badge="${n.id}" hidden></span></a>`,
      )
      .join("");
  }

  function updateBadges() {
    const el = document.querySelector('[data-badge="requests"]');
    const n = isAdmin()
      ? state.requests.filter((r) => r.status === "Pending").length
      : 0;
    if (el) {
      el.hidden = !n;
      el.textContent = n;
      el.title = n ? `${n} pending review` : "";
    }
    const topbarBadge = $("topbarBadge");
    topbarBadge.hidden = !n;
    topbarBadge.textContent = n > 9 ? "9+" : n;
    topbarBadge.title = n ? `${n} pending review` : "";
  }

  function currentHash() {
    return location.hash.replace(/^#\/?/, "").split("?")[0] || "overview";
  }

  function route() {
    if (!state.user) return;
    const allowed = NAV[state.user.role].map((n) => n.id);
    let view = currentHash();
    if (!allowed.includes(view)) view = "overview";
    state.view = view;
    document
      .querySelectorAll(".view")
      .forEach((s) => (s.hidden = s.id !== `view-${view}`));
    document.querySelectorAll("#nav a").forEach((a) => {
      if (a.dataset.nav === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const t = TITLES[view];
    const title = typeof t === "string" ? t : t[state.user.role];
    $("pageTitle").textContent = title;
    document.title = `${title} – EcoCycle`;
    $("app").classList.toggle("is-overview", view === "overview");
    $("app").classList.remove("nav-open");
    updateBadges();
    if (view === "overview") renderOverview();
    if (view === "requests") renderRequests();
    if (view === "new") prepareForm();
    if (view === "categories") renderCategories();
    if (view === "map") showMap();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------
   * Shared renderers
   * ------------------------------------------------------------------ */
  const pill = (status) =>
    `<span class="pill s-${sKey(status)}">${esc(status)}</span>`;

  function requestRow(r, withRequester) {
    return `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}">
      <td><span class="id">${esc(displayId(r.id))}</span><span class="sub">${esc(fmtDate(r.createdAt))}</span></td>
      ${withRequester ? `<td class="col-requester">${esc(r.user)}<span class="sub">${esc(r.email || "")}</span></td>` : ""}
      <td>${esc(r.category)}${r.qty > 1 ? `<span class="sub">Quantity ${esc(r.qty)}</span>` : ""}</td>
      <td class="method">${esc(r.method)}</td>
      <td class="num">${esc(fmtDate(r.date))}</td>
      <td class="col-location"><div class="clip" title="${esc(r.location)}">${esc(r.location)}</div></td>
      <td>${pill(r.status)}</td>
    </tr>`;
  }

  /* ------------------------------------------------------------------
   * Overview
   * ------------------------------------------------------------------ */
  function kpi(label, value, note) {
    const details = {
      "Total requests": ["clock", "blue"],
      "My requests": ["list", "blue"],
      "Awaiting review": ["check", "green"],
      "In progress": ["grid", "purple"],
      Completed: ["check", "amber"],
      "Rejected or cancelled": ["x", "rose"],
    };
    const [glyph, tone] = details[label] || ["box", "blue"];
    return `<article class="kpi kpi-${tone}">
      <div class="kpi-heading"><span class="kpi-icon">${icon(glyph)}</span><span class="kpi-label">${esc(label)}</span></div>
      <div class="kpi-value">${esc(value)}</div>
      <div class="kpi-note">${esc(note)}</div>
    </article>`;
  }

  function weekBuckets(requests, weeks = 8) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    ); // Monday
    const buckets = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const s = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() - i * 7,
      );
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
      buckets.push({ start: s, end: e, count: 0 });
    }
    for (const r of requests) {
      const t = new Date(r.createdAt).getTime();
      const b = buckets.find(
        (x) => t >= x.start.getTime() && t < x.end.getTime(),
      );
      if (b) b.count++;
    }
    return buckets;
  }

  function renderOverview() {
    const mine = myRequests();
    const count = (fn) => mine.filter(fn).length;
    const pending = count((r) => r.status === "Pending");
    const active = count((r) => IN_PROGRESS.includes(r.status));
    const done = count((r) => r.status === "Completed");

    if (isAdmin()) {
      $("kpis").innerHTML =
        kpi("Total requests", mine.length, "All time") +
        kpi(
          "Awaiting review",
          pending,
          pending ? "Needs a decision" : "Queue is clear",
        ) +
        kpi("In progress", active, "Approved to processing") +
        kpi(
          "Completed",
          done,
          mine.length
            ? `${Math.round((done / mine.length) * 100)}% of all requests`
            : "No requests yet",
        ) +
        kpi(
          "Rejected or cancelled",
          count((r) => ["Rejected", "Cancelled"].includes(r.status)),
          "Closed without collection",
        );

      const statusCounts = STATUSES.map((s) => ({
        s,
        n: count((r) => r.status === s),
      }));
      const total = mine.length || 1;
      const byCat = Object.entries(
        mine.reduce(
          (a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a),
          {},
        ),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const maxCat = Math.max(1, ...byCat.map((c) => c[1]));
      const weeks = weekBuckets(mine, 6);
      const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
      const weekScale = Math.max(8, Math.ceil(maxWeek / 2) * 2);
      const statusColors = {
        Pending: "#f5ac32",
        Scheduled: "#3679ed",
        Processing: "#784be8",
        Rejected: "#e74670",
        Approved: "#12aaa0",
        Collected: "#32b66a",
        Completed: "#22a879",
        Cancelled: "#9aa7b8",
      };
      let statusStop = 0;
      const donutStops = statusCounts
        .filter((x) => x.n)
        .map((x) => {
          const start = statusStop;
          statusStop += (x.n / total) * 100;
          return `${statusColors[x.s]} ${start}% ${statusStop}%`;
        })
        .join(", ");
      const queue = mine
        .filter((r) => r.status === "Pending")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, 5);

      $("overviewGrid").innerHTML = `
        <section class="panel status-panel">
          <div class="panel-head"><h2>Requests by status</h2></div>
          <div class="panel-body status-content">
            <div class="donut-wrap">
              <div class="status-donut" role="img" aria-label="Status distribution: ${statusCounts.filter((x) => x.n).map((x) => `${x.n} ${x.s.toLowerCase()}`).join(", ") || "no requests"}" style="--donut:${donutStops || "#dce3ed 0% 100%"}">
                <div><strong>${mine.length}</strong><span>Total requests</span></div>
              </div>
            </div>
            <ul class="legend">
              ${statusCounts.filter((x) => x.n).map((x) => `<li><i style="--legend-color:${statusColors[x.s]}"></i><span>${esc(x.s)}</span><b>${x.n}</b><small>${Math.round((x.n / total) * 100)}%</small></li>`).join("")}
            </ul>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Requests by category</h2><span class="panel-tag">Top ${byCat.length}</span></div>
          <div class="panel-body">
            ${byCat.length ? `<ul class="bars">${byCat.map(([n, c], i) => {
              const code = CATEGORIES.find((category) => category.name === n)?.code || n.slice(0, 2).toUpperCase();
              return `<li class="category-bar">
                <span class="category-mark category-mark-${i % 6}" aria-hidden="true">${esc(code)}</span>
                <span class="bar-label" title="${esc(n)}">${esc(n)}</span>
                <span class="bar-track"><span class="bar-fill" style="display:block;width:${(c / maxCat) * 100}%"></span></span>
                <span class="bar-val">${c}</span><small>${Math.round((c / total) * 100)}%</small>
              </li>`;
            }).join("")}</ul>` : `<p class="hint">No requests yet.</p>`}
          </div>
        </section>
        <section class="panel weekly-panel">
          <div class="panel-head"><h2>Requests per week</h2><span class="panel-tag">Last 6 weeks</span></div>
          <div class="panel-body weekly-body">
            <div class="weekly-chart" role="img" aria-label="Requests per week: ${weeks.map((w) => `${w.count} on week starting ${w.start.toLocaleDateString("en-IN")}`).join(", ")}">
              <div class="chart-axis">${[weekScale, weekScale * .75, weekScale * .5, weekScale * .25, 0].map((tick) => `<span>${Math.round(tick)}</span>`).join("")}</div>
              <div class="chart-plot">
                ${weeks.map((w) => `<div class="week-column"><b>${w.count || ""}</b><span style="height:${(w.count / weekScale) * 100}%"></span></div>`).join("")}
              </div>
            </div>
            <div class="week-labels">${weeks.map((w, i) => `<span>Week ${i + 1}</span>`).join("")}</div>
          </div>
        </section>
        <section class="panel flush">
          <div class="panel-head"><h2>Awaiting review</h2><a class="link queue-link" href="#/requests">Open tracker <span aria-hidden="true">→</span></a></div>
          ${
            queue.length
              ? `<ul class="queue">${queue
                  .map(
                    (r) => `
            <li>
              <span class="queue-icon" aria-hidden="true">${esc(CATEGORIES.find((category) => category.name === r.category)?.code || r.category.slice(0, 2).toUpperCase())}</span>
              <div class="queue-main" data-open="${esc(r.id)}" tabindex="0">
                <strong>${esc(r.category)} · ${esc(r.user)}</strong>
                <span>${esc(r.method)} · ${esc(fmtDate(r.date))} · ${esc(r.location)}</span>
              </div>
              <div class="queue-actions">
                <button class="btn btn-sm" type="button" data-quick="Approved" data-id="${esc(r.id)}">Approve</button>
                <button class="btn btn-sm btn-ghost-danger" type="button" data-quick="Rejected" data-id="${esc(r.id)}">Reject</button>
              </div>
            </li>`,
                  )
                  .join("")}</ul>`
              : `<div class="empty"><strong>No requests waiting</strong>New requests will appear here.</div>`
          }
        </section>`;
    } else {
      const upcoming = mine
        .filter((r) => IN_PROGRESS.includes(r.status) || r.status === "Pending")
        .filter((r) => r.date >= todayISO())
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      $("kpis").innerHTML =
        kpi("My requests", mine.length, "All time") +
        kpi("Awaiting review", pending, "Not yet approved") +
        kpi("In progress", active, "Approved to processing") +
        kpi("Completed", done, "Recycled");

      const recent = [...mine]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);
      $("overviewGrid").innerHTML = `
        <section class="panel flush">
          <div class="panel-head"><h2>Recent requests</h2><a class="link" href="#/requests">View all</a></div>
          ${
            recent.length
              ? `<div class="table-wrap"><table class="tbl"><thead><tr><th scope="col">Request</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead><tbody>
            ${recent.map((r) => `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}"><td><span class="id">${esc(displayId(r.id))}</span></td><td>${esc(r.category)}<span class="sub">${esc(r.method)}</span></td><td class="num">${esc(fmtDate(r.date))}</td><td>${pill(r.status)}</td></tr>`).join("")}
          </tbody></table></div>`
              : `<div class="empty"><strong>No requests yet</strong>Book a pickup or choose a drop-off point.<br /><a class="btn btn-primary" href="#/new">New request</a></div>`
          }
        </section>
        <section class="panel flush">
          <div class="panel-head"><h2>Next steps</h2></div>
          <ul class="next-list">
            <li><div>${upcoming ? `<strong>Next handover: ${esc(fmtDate(upcoming.date))}</strong><small>${esc(upcoming.category)} · ${esc(upcoming.method)}</small>` : `<strong>No handover scheduled</strong><small>Create a request to book one</small>`}</div>${upcoming ? `<button class="btn btn-sm" type="button" data-open="${esc(upcoming.id)}">View</button>` : `<a class="btn btn-sm btn-primary" href="#/new">New request</a>`}</li>
            <li><div><strong>Find a drop-off point</strong><small>Recycling points and shops on a map</small></div><a class="btn btn-sm" href="#/map">Open map</a></li>
            <li><div><strong>Check the safety guide</strong><small>Batteries and devices</small></div><a class="btn btn-sm" href="#/guide">Read</a></li>
          </ul>
        </section>`;
    }
  }

  /* ------------------------------------------------------------------
   * Requests list
   * ------------------------------------------------------------------ */
  let controlsReady = false;
  function setupStaticControls() {
    if (controlsReady) {
      refreshStatusFilter();
      return;
    }
    controlsReady = true;
    $("requestSearch").addEventListener("input", renderRequests);
    $("globalSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const query = $("globalSearch").value.trim();
      if (!query) {
        $("globalSearch").focus();
        return;
      }
      $("requestSearch").value = query;
      if (state.view === "requests") renderRequests();
      else location_hash("#/requests");
    });
    $("statusFilter").addEventListener("change", renderRequests);
    $("methodFilter").addEventListener("change", renderRequests);
    $("exportCsv").addEventListener("click", exportCsv);
    refreshStatusFilter();
  }
  function refreshStatusFilter() {
    $("statusFilter").innerHTML =
      `<option value="all">All statuses</option>` +
      STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("");
    $("exportCsv").hidden = !isAdmin();
    $("requestSearch").placeholder = isAdmin()
      ? "Search by name, item, location or ID"
      : "Search my requests";
  }

  function filteredRequests() {
    const q = $("requestSearch").value.trim().toLowerCase();
    const st = $("statusFilter").value;
    const me = $("methodFilter").value;
    return myRequests()
      .filter(
        (r) =>
          (st === "all" || r.status === st) &&
          (me === "all" || r.method === me),
      )
      .filter(
        (r) =>
          !q ||
          [
            displayId(r.id),
            r.id,
            r.user,
            r.email,
            r.category,
            r.location,
            r.method,
            r.status,
          ].some((f) =>
            String(f ?? "")
              .toLowerCase()
              .includes(q),
          ),
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function renderRequests() {
    const withReq = isAdmin();
    document.querySelector(".col-requester").hidden = !withReq;
    const rows = filteredRequests();
    const total = myRequests().length;
    $("requestCount").textContent =
      `${rows.length} of ${total} ${total === 1 ? "request" : "requests"}`;
    $("requestsBody").innerHTML = rows.length
      ? rows.map((r) => requestRow(r, withReq)).join("")
      : `<tr><td colspan="${withReq ? 7 : 6}"><div class="empty"><strong>${total ? "No requests match these filters" : "No requests yet"}</strong>${total ? "Try clearing the search or status filter." : isAdmin() ? "Requests will appear here when users submit them." : 'Create your first request to get started.<br /><a class="btn btn-primary" href="#/new">New request</a>'}</div></td></tr>`;
    updateBadges();
  }

  function csvCell(v) {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // avoid spreadsheet formula execution
    return `"${s.replace(/"/g, '""')}"`;
  }
  function exportCsv() {
    const rows = filteredRequests();
    const head = [
      "Request ID",
      "Requester",
      "Email",
      "Phone",
      "Category",
      "Quantity",
      "Method",
      "Date",
      "Location",
      "Status",
      "Created",
      "Notes",
    ];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) =>
        [
          displayId(r.id),
          r.user,
          r.email,
          r.phone,
          r.category,
          r.qty,
          r.method,
          r.date,
          r.location,
          r.status,
          r.createdAt,
          r.notes,
        ]
          .map(csvCell)
          .join(","),
      ),
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ecocycle-requests-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(
      `Exported ${rows.length} ${rows.length === 1 ? "request" : "requests"}`,
    );
  }

  /* ------------------------------------------------------------------
   * Drawer
   * ------------------------------------------------------------------ */
  let drawerReturnFocus = null;
  function openDrawer(id) {
    const r = findRequest(id);
    if (!r) return;
    if (
      !isAdmin() &&
      String(r.email).toLowerCase() !== state.user.email.toLowerCase()
    )
      return;
    state.openRequestId = r.id;
    drawerReturnFocus = document.activeElement;
    renderDrawer();
    $("drawerScrim").hidden = false;
    $("drawer").hidden = false;
    $("drawerClose").focus();
  }
  function closeDrawer() {
    if ($("drawer").hidden) return;
    $("drawer").hidden = true;
    $("drawerScrim").hidden = true;
    state.openRequestId = null;
    drawerReturnFocus?.focus?.();
  }
  function renderDrawer() {
    const r = findRequest(state.openRequestId);
    if (!r) return closeDrawer();
    $("drawerTitle").textContent = displayId(r.id);
    $("drawerSub").innerHTML = pill(r.status);
    const hist = [...(r.history || [])].reverse();
    const canCancel = !isAdmin() && r.status === "Pending";
    $("drawerBody").innerHTML = `
      <dl class="dl">
        <dt>Requester</dt><dd>${esc(r.user)}<br /><span class="hint">${esc(r.email || "")}${r.phone ? ` · ${esc(r.phone)}` : ""}</span></dd>
        <dt>Category</dt><dd>${esc(r.category)}${r.qty ? ` · Quantity ${esc(r.qty)}` : ""}</dd>
        <dt>Method</dt><dd>${esc(r.method)}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off date" : "Pickup date"}</dt><dd>${esc(fmtDate(r.date))}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off point" : "Address"}</dt><dd>${esc(r.location)}</dd>
        ${r.notes ? `<dt>Notes</dt><dd>${esc(r.notes)}</dd>` : ""}
        <dt>Submitted</dt><dd>${esc(fmtDateTime(r.createdAt))}</dd>
      </dl>
      <h3>History</h3>
      <ol class="timeline">
        ${hist.map((h) => `<li><strong>${esc(h.status)}</strong><small>${esc(fmtDateTime(h.at))}${h.by ? ` · ${esc(h.by)}` : ""}</small></li>`).join("")}
      </ol>
      ${
        isAdmin()
          ? `
        <h3>Update status</h3>
        <div class="manage">
          <label class="sr-only" for="drawerStatus">Status</label>
          <select id="drawerStatus">${STATUSES.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select>
          <button class="btn btn-primary" type="button" id="drawerSave">Save</button>
        </div>
        <div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerDelete">${icon("trash")}Delete request</button></div>`
          : canCancel
            ? `<div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerCancel">Cancel this request</button></div>`
            : ""
      }
    `;
  }

  function setStatus(r, status, by) {
    if (r.status === status) return false;
    r.status = status;
    r.history = [
      ...(r.history || []),
      { status, at: new Date().toISOString(), by },
    ];
    return true;
  }
  function afterChange(message) {
    const ok = persist();
    updateBadges();
    if (state.view === "overview") renderOverview();
    if (state.view === "requests") renderRequests();
    if (!$("drawer").hidden) renderDrawer();
    toast(
      ok ? message : `${message} (not saved: browser storage is unavailable)`,
      ok ? "ok" : "error",
    );
  }

  /* ------------------------------------------------------------------
   * New request form
   * ------------------------------------------------------------------ */
  function selectedMethod() {
    return document.querySelector('input[name="fMethod"]:checked').value;
  }
  function applyMethod() {
    const drop = selectedMethod() === "Drop-off";
    $("fAddressField").hidden = drop;
    $("fDropField").hidden = !drop;
    $("fDateLabel").textContent = drop ? "Drop-off date" : "Pickup date";
  }
  function prepareForm() {
    if (isAdmin()) return;
    $("fName").value = state.user.name;
    $("fEmail").value = state.user.email;
    $("fDate").min = todayISO();
    if (!$("fCategory").options.length) {
      $("fCategory").innerHTML = CATEGORIES.map(
        (c) => `<option>${esc(c.name)}</option>`,
      ).join("");
    }
    if (pendingDrop) {
      document.querySelector(
        'input[name="fMethod"][value="Drop-off"]',
      ).checked = true;
      $("fDrop").value = pendingDrop;
      pendingDrop = "";
    }
    if (pendingCategory) {
      $("fCategory").value = pendingCategory;
      pendingCategory = "";
    }
    applyMethod();
    $("requestError").textContent = "";
  }
  let pendingDrop = "";
  let pendingCategory = "";

  function submitRequest(e) {
    e.preventDefault();
    if (isAdmin()) return;
    const err = $("requestError");
    const method = selectedMethod();
    const date = $("fDate").value;
    const location = (
      method === "Drop-off" ? $("fDrop").value : $("fAddress").value
    ).trim();
    const qty = Math.max(1, Math.min(99, parseInt($("fQty").value, 10) || 1));
    if (!date) {
      err.textContent = "Choose a date.";
      $("fDate").focus();
      return;
    }
    if (date < todayISO()) {
      err.textContent = "The date can’t be in the past.";
      $("fDate").focus();
      return;
    }
    if (!location) {
      err.textContent =
        method === "Drop-off"
          ? "Enter or choose a drop-off point."
          : "Enter the pickup address.";
      (method === "Drop-off" ? $("fDrop") : $("fAddress")).focus();
      return;
    }
    err.textContent = "";
    const id =
      Math.max(1000, ...state.requests.map((r) => Number(r.id) || 0)) + 1;
    const now = new Date().toISOString();
    state.requests.unshift({
      id,
      user: state.user.name,
      email: state.user.email,
      phone: $("fPhone").value.trim(),
      category: $("fCategory").value,
      qty,
      method,
      date,
      location,
      notes: $("fNotes").value.trim(),
      status: "Pending",
      createdAt: now,
      history: [{ status: "Pending", at: now, by: "Requester" }],
    });
    const ok = persist();
    $("requestForm").reset();
    $("fDrop").value = "";
    toast(
      ok
        ? `Request ${displayId(id)} submitted`
        : `Request ${displayId(id)} submitted (not saved: browser storage is unavailable)`,
      ok ? "ok" : "error",
    );
    location_hash("#/requests");
  }
  const location_hash = (h) => {
    window.location.hash = h;
  };

  /* ------------------------------------------------------------------
   * Categories
   * ------------------------------------------------------------------ */
  function renderCategories() {
    $("categoryBody").innerHTML = CATEGORIES.map(
      (c) => `<tr>
        <td><span class="cat-code" aria-hidden="true">${esc(c.code)}</span><strong style="font-weight:500">${esc(c.name)}</strong></td>
        <td>${esc(c.desc)}</td>
        <td class="method">${esc(c.note || "Standard")}</td>
        <td class="actions">${isAdmin() ? "" : `<button class="btn btn-sm" type="button" data-category="${esc(c.name)}">Request collection</button>`}</td>
      </tr>`,
    ).join("");
  }

  /* ------------------------------------------------------------------
   * Map
   * ------------------------------------------------------------------ */
  const GEOCODER = "https://nominatim.openstreetmap.org/search";
  const OVERPASS = [
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  const KINDS = {
    recycling: {
      label: "Recycling point",
      color: "#0f8a6a",
      cls: "k-recycling",
    },
    shop: { label: "Electronics shop", color: "#2b6cb0", cls: "k-shop" },
    scrap: { label: "Scrap yard", color: "#b7791f", cls: "k-scrap" },
  };
  const M = {
    map: null,
    group: null,
    originMarker: null,
    circle: null,
    items: [],
    markers: new Map(),
    filter: "all",
    selected: null,
    controller: null,
    lastGeocodeAt: 0,
    lastPopupClose: 0,
    origin: null,
    busy: false,
  };

  function mapMessage(text, isError = false) {
    const el = $("mapStatus");
    el.textContent = text;
    el.classList.toggle("is-error", isError);
  }

  function showMap() {
    if (!$("quickCities").children.length) {
      $("quickCities").innerHTML =
        `<span>Try:</span>` +
        QUICK_CITIES.map(
          (c) =>
            `<button type="button" data-city="${esc(c)}">${esc(c)}</button>`,
        ).join("");
      renderChips();
    }
    if (!M.map) initMap();
    // The container was hidden when created; Leaflet needs a size refresh.
    setTimeout(() => M.map && M.map.invalidateSize(), 0);
  }

  function initMap() {
    if (typeof L === "undefined") {
      $("map").innerHTML =
        `<div class="place-empty">The map library could not be loaded. Check that the <code>vendor/leaflet</code> folder is next to <code>index.html</code>.</div>`;
      return;
    }
    const map = L.map("map", {
      zoomControl: true,
      minZoom: 4,
      maxZoom: 18,
    }).setView([22.6, 79.0], 5);
    M.map = map;

    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    });
    const carto = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      },
    );
    // Try the other tile provider if the initial provider is unavailable.
    const startOnCarto = location.protocol === "file:";
    let active = startOnCarto ? carto : osm;
    let activeTileErrors = 0;
    let tileFailureReported = false;
    const attemptedTileLayers = new Set([active]);
    const handleTileError = (event) => {
      if (event.target !== active) return;
      activeTileErrors++;
      if (activeTileErrors < 4) return;

      const fallback = [osm, carto].find(
        (layer) => !attemptedTileLayers.has(layer),
      );
      if (!fallback) {
        if (!tileFailureReported) {
          tileFailureReported = true;
          mapMessage(
            "Map tiles could not be loaded. Check your internet connection and try again.",
            true,
          );
        }
        return;
      }

      map.removeLayer(active);
      active = fallback;
      attemptedTileLayers.add(active);
      activeTileErrors = 0;
      active.addTo(map);
    };
    for (const layer of [osm, carto]) {
      layer.on("tileerror", handleTileError);
      layer.on("tileload", (event) => {
        if (event.target === active) activeTileErrors = 0;
      });
    }
    active.addTo(map);

    M.group = L.layerGroup().addTo(map);

    map.on("popupclose", () => {
      M.lastPopupClose = Date.now();
    });
    map.on("click", (e) => {
      if (Date.now() - M.lastPopupClose < 300 || M.busy) return;
      runSearch({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        label: "the selected point",
      });
    });
  }

  function setBusy(busy) {
    M.busy = busy;
    $("mapSearchBtn").disabled = busy;
    $("mapLocateBtn").disabled = busy;
    $("mapSearchBtn").textContent = busy ? "Searching…" : "Search";
    $("map").style.cursor = busy ? "progress" : "";
  }

  async function geocode(query, signal) {
    const wait = Math.max(0, 1100 - (Date.now() - M.lastGeocodeAt));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    M.lastGeocodeAt = Date.now();
    const url = `${GEOCODER}?${new URLSearchParams({ format: "jsonv2", limit: "1", countrycodes: "in", "accept-language": "en", q: query })}`;
    let res;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal,
      });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw new Error(
        "The place search could not be reached. Check your internet connection and try again.",
      );
    }
    if (!res.ok)
      throw new Error(
        `The place search is unavailable right now (HTTP ${res.status}). Try again shortly.`,
      );
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data))
      throw new Error(
        "The place search returned an unexpected response. Try again.",
      );
    if (!data.length)
      throw new Error(
        `No place found for “${query}” in India. Try a nearby city or a PIN code.`,
      );
    const lat = Number(data[0].lat),
      lon = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon))
      throw new Error("The place search returned invalid coordinates.");
    return {
      latitude: lat,
      longitude: lon,
      label: data[0].name || (data[0].display_name || query).split(",")[0],
    };
  }

  function overpassQuery(o, radiusM) {
    const around = `(around:${radiusM},${o.latitude},${o.longitude})`;
    return `[out:json][timeout:15];\n(\n  nwr${around}["amenity"="recycling"][~"^recycling:(electrical_appliances|electrical|electrical_items|electronics|small_appliances|computer|mobile_phones)$"~"^(yes|only|limited|separate)$",i];\n  nwr${around}["shop"~"^(electronics|electrical|computer|mobile_phone|appliance|hifi|camera|video_games|telecommunication|battery|computer_parts)$",i];\n  nwr${around}["amenity"="scrap_yard"];\n);\nout tags center 400;`;
  }

  async function overpassFetch(query, signal) {
    let lastError = null;
    for (const endpoint of OVERPASS) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const ctrl = new AbortController();
      const onAbort = () => ctrl.abort();
      signal.addEventListener("abort", onAbort);
      const timer = setTimeout(() => ctrl.abort(), 18000);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: new URLSearchParams({ data: query }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        if (!data || !Array.isArray(data.elements)) {
          lastError = new Error("Bad response");
          continue;
        }
        if (
          data.remark &&
          /error|timed out|out of memory/i.test(data.remark) &&
          !data.elements.length
        ) {
          lastError = new Error(data.remark);
          continue;
        }
        const dataTimestamp = data.osm3s?.timestamp_osm_base;
        if (
          dataTimestamp &&
          (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
            dataTimestamp,
          ) ||
            Number.isNaN(Date.parse(dataTimestamp)))
        ) {
          lastError = new Error("Invalid map data timestamp");
          continue;
        }
        return data.elements;
      } catch (e) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        lastError = e;
      } finally {
        clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
      }
    }
    const detail =
      lastError instanceof Error && /^HTTP \d{3}$/.test(lastError.message)
        ? ` (last response: ${lastError.message})`
        : "";
    throw new Error(
      `The map data servers are not responding${detail}. Try again in a minute, or choose a smaller radius.`,
    );
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const r = (d) => (d * Math.PI) / 180;
    const a =
      Math.sin(r(lat2 - lat1) / 2) ** 2 +
      Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const fmtDist = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  function toPlace(el, origin) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const t = el.tags || {};
    const kind =
      t.amenity === "recycling"
        ? "recycling"
        : t.amenity === "scrap_yard"
          ? "scrap"
          : "shop";
    const address =
      t["addr:full"] ||
      [
        [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
        t["addr:place"],
        t["addr:suburb"],
        t["addr:city"],
        t["addr:postcode"],
      ]
        .filter(Boolean)
        .join(", ");
    const phone = t["contact:phone"] || t.phone || "";
    const web = t.website || t["contact:website"] || "";
    return {
      key: `${el.type}/${el.id}`,
      kind,
      lat,
      lon,
      name:
        t.name ||
        t.operator ||
        t.brand ||
        (kind === "shop"
          ? "Electronics shop"
          : kind === "scrap"
            ? "Scrap yard"
            : "E-waste recycling point"),
      address,
      phone,
      hours: t.opening_hours || "",
      web: /^https?:\/\//i.test(web) ? web : "",
      osm: `https://www.openstreetmap.org/${encodeURIComponent(el.type)}/${encodeURIComponent(el.id)}`,
      distance: haversine(origin.latitude, origin.longitude, lat, lon),
    };
  }

  async function runSearch(input) {
    if (!M.map) initMap();
    if (!M.map) return;
    M.controller?.abort();
    const ctrl = new AbortController();
    M.controller = ctrl;
    setBusy(true);
    const radiusKm = Number($("mapRadius").value) || 10;
    try {
      let origin = input;
      if (input.query) {
        mapMessage(`Finding ${input.query}…`);
        origin = await geocode(input.query, ctrl.signal);
      }
      M.origin = origin;
      placeOrigin(origin, radiusKm);
      mapMessage(`Searching within ${radiusKm} km of ${origin.label}…`);
      $("placeList").innerHTML = "";
      const elements = await overpassFetch(
        overpassQuery(origin, radiusKm * 1000),
        ctrl.signal,
      );
      const seen = new Map();
      for (const el of elements) {
        const p = toPlace(el, origin);
        if (p && p.distance <= radiusKm * 1.02) seen.set(p.key, p);
      }
      M.items = [...seen.values()]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 150);
      M.selected = null;
      renderMapResults();
      const n = M.items.length;
      mapMessage(
        n
          ? `${n} ${n === 1 ? "place" : "places"} within ${radiusKm} km of ${origin.label}. Confirm e-waste acceptance before you go.`
          : `No mapped places within ${radiusKm} km of ${origin.label}. Try a larger radius or a nearby city.`,
      );
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error(e);
      M.items = [];
      renderMapResults();
      mapMessage(
        e instanceof Error ? e.message : "The search failed. Try again.",
        true,
      );
    } finally {
      if (M.controller === ctrl) {
        M.controller = null;
        setBusy(false);
      }
    }
  }

  function placeOrigin(origin, radiusKm) {
    const ll = [origin.latitude, origin.longitude];
    if (M.originMarker) M.map.removeLayer(M.originMarker);
    if (M.circle) M.map.removeLayer(M.circle);
    M.originMarker = L.marker(ll, {
      icon: L.divIcon({
        className: "",
        html: '<div class="origin-pin"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      keyboard: false,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(M.map);
    M.circle = L.circle(ll, {
      radius: radiusKm * 1000,
      color: "#0f5a47",
      weight: 1.5,
      dashArray: "5 5",
      fillColor: "#0f5a47",
      fillOpacity: 0.05,
      interactive: false,
    }).addTo(M.map);
    M.map.fitBounds(M.circle.getBounds(), { padding: [20, 20] });
  }

  function popupHtml(p) {
    return `<div class="pop">
      <strong>${esc(p.name)}</strong>
      <span class="pop-type">${esc(KINDS[p.kind].label)} · ${esc(fmtDist(p.distance))} away</span>
      ${p.address ? `<p>${esc(p.address)}</p>` : ""}
      ${p.phone ? `<p>Phone: <a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></p>` : ""}
      ${p.hours ? `<p>Hours: ${esc(p.hours)}</p>` : ""}
      <div class="pop-actions">
        ${state.user?.role === "user" ? `<button class="btn" type="button" data-use="${esc(p.key)}">Use for drop-off request</button>` : ""}
        <a class="alt" href="${esc(p.osm)}" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
      </div>
    </div>`;
  }

  function visibleItems() {
    return M.filter === "all"
      ? M.items
      : M.items.filter((p) => p.kind === M.filter);
  }

  function renderChips() {
    const counts = { all: M.items.length, recycling: 0, shop: 0, scrap: 0 };
    M.items.forEach((p) => counts[p.kind]++);
    const defs = [
      ["all", "All", null],
      ["recycling", "Recycling points", "k-recycling"],
      ["shop", "Shops", "k-shop"],
      ["scrap", "Scrap yards", "k-scrap"],
    ];
    $("typeChips").innerHTML = defs
      .map(
        ([k, label, cls]) =>
          `<button type="button" class="chip ${cls || ""}" data-filter="${k}" aria-pressed="${M.filter === k}">${cls ? "<i></i>" : ""}${label}<span>${counts[k]}</span></button>`,
      )
      .join("");
  }

  function renderMapResults() {
    renderChips();
    M.group?.clearLayers();
    M.markers.clear();
    const items = visibleItems();
    for (const p of items) {
      const m = L.circleMarker([p.lat, p.lon], {
        radius: 7,
        weight: 2,
        color: "#ffffff",
        fillColor: KINDS[p.kind].color,
        fillOpacity: 1,
        bubblingMouseEvents: false,
      }).addTo(M.group);
      m.bindPopup(popupHtml(p), { maxWidth: 280, autoPanPadding: [30, 30] });
      m.on("click", () => selectPlace(p.key, { fly: false, scrollList: true }));
      m.bindTooltip(p.name, { direction: "top", offset: [0, -6] });
      M.markers.set(p.key, m);
    }
    $("placeTitle").textContent = M.items.length
      ? `${items.length} ${items.length === 1 ? "place" : "places"}`
      : "Results";
    $("placeList").innerHTML = items.length
      ? items.map(placeItemHtml).join("")
      : `<li class="place-empty">${M.items.length ? "No places of this type. Choose another filter." : "Results will appear here."}</li>`;
  }

  function placeItemHtml(p) {
    const k = KINDS[p.kind];
    return `<li class="place ${k.cls}" data-place="${esc(p.key)}" tabindex="0">
      <div class="place-top"><span class="place-name">${esc(p.name)}</span><span class="place-dist">${esc(fmtDist(p.distance))}</span></div>
      <div class="place-type"><i></i>${esc(k.label)}</div>
      ${p.address ? `<div class="place-addr">${esc(p.address)}</div>` : ""}
      <div class="place-meta">
        ${p.phone ? `<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${icon("phone")}${esc(p.phone)}</a>` : ""}
        ${p.hours ? `<span>${icon("clock")}${esc(p.hours)}</span>` : ""}
      </div>
      ${state.user?.role === "user" ? `<div class="place-actions"><button class="btn btn-sm" type="button" data-use="${esc(p.key)}">Use for drop-off request</button></div>` : ""}
    </li>`;
  }

  function selectPlace(key, { fly = true, scrollList = false } = {}) {
    M.selected = key;
    document
      .querySelectorAll(".place")
      .forEach((el) =>
        el.classList.toggle("is-selected", el.dataset.place === key),
      );
    const marker = M.markers.get(key);
    M.markers.forEach((m, k) => m.setStyle({ radius: k === key ? 10 : 7 }));
    if (marker) {
      marker.bringToFront();
      if (fly)
        M.map.flyTo(marker.getLatLng(), Math.max(M.map.getZoom(), 15), {
          duration: 0.6,
        });
      marker.openPopup();
    }
    if (scrollList)
      document
        .querySelector(`.place[data-place="${CSS.escape(key)}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }

  function useForDropoff(key) {
    const p = M.items.find((x) => x.key === key);
    if (!p || state.user?.role !== "user") return;
    pendingDrop = p.address
      ? `${p.name}, ${p.address}`
      : `${p.name} (near ${M.origin?.label || "selected area"})`;
    location_hash("#/new");
    toast("Drop-off point added to your request");
  }

  function locate() {
    if (!navigator.geolocation) {
      mapMessage(
        "This browser does not support location. Search by city or PIN code instead.",
        true,
      );
      return;
    }
    setBusy(true);
    mapMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false);
        runSearch({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: "your location",
        });
      },
      (err) => {
        setBusy(false);
        mapMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was declined. Search by city or PIN code instead."
            : "Your location could not be determined. Search by city or PIN code instead.",
          true,
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  /* ------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------ */
  function wire() {
    $("loginTab").addEventListener("click", () => setAuthMode("login"));
    $("signupTab").addEventListener("click", () => setAuthMode("signup"));
    $("authForm").addEventListener("submit", submitAuth);
    document.querySelectorAll("[data-demo]").forEach((b) =>
      b.addEventListener("click", () => {
        const admin = b.dataset.demo === "admin";
        setAuthMode("login");
        $("authRole").value = admin ? "admin" : "user";
        $("authEmail").value = admin
          ? "admin@ecocycle.example"
          : "rahul@example.com";
        $("authPassword").value = "demo1234";
        $("authSubmit").focus();
      }),
    );
    $("logoutButton").addEventListener("click", endSession);
    $("themeToggle").addEventListener("click", () =>
      setTheme(document.body.dataset.theme === "dark" ? "light" : "dark"),
    );
    $("menuButton").addEventListener("click", () =>
      $("app").classList.toggle("nav-open"),
    );
    $("scrim").addEventListener("click", () =>
      $("app").classList.remove("nav-open"),
    );
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        $("globalSearch").focus();
      }
    });

    $("requestForm").addEventListener("submit", submitRequest);
    document
      .querySelectorAll('input[name="fMethod"]')
      .forEach((r) => r.addEventListener("change", applyMethod));

    $("mapSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("mapQuery").value.trim();
      if (!q) {
        mapMessage("Enter a city or PIN code.", true);
        $("mapQuery").focus();
        return;
      }
      runSearch({ query: q });
    });
    $("mapLocateBtn").addEventListener("click", locate);
    $("mapRadius").addEventListener("change", () => {
      if (M.origin && !M.busy)
        runSearch({
          latitude: M.origin.latitude,
          longitude: M.origin.longitude,
          label: M.origin.label,
        });
    });
    $("quickCities").addEventListener("click", (e) => {
      const b = e.target.closest("[data-city]");
      if (!b) return;
      $("mapQuery").value = b.dataset.city;
      runSearch({ query: b.dataset.city });
    });
    $("typeChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      M.filter = b.dataset.filter;
      renderMapResults();
    });
    $("placeList").addEventListener("click", (e) => {
      const use = e.target.closest("[data-use]");
      if (use) {
        useForDropoff(use.dataset.use);
        return;
      }
      if (e.target.closest("a")) return;
      const li = e.target.closest("[data-place]");
      if (li) selectPlace(li.dataset.place);
    });
    $("placeList").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const li = e.target.closest("[data-place]");
      if (li && e.target === li) {
        e.preventDefault();
        selectPlace(li.dataset.place);
      }
    });
    // Buttons inside Leaflet popups
    document.addEventListener("click", (e) => {
      const use = e.target.closest(".leaflet-popup [data-use]");
      if (use) useForDropoff(use.dataset.use);
    });

    // Delegated: open request details, quick actions, category shortcut
    document.addEventListener("click", (e) => {
      const quick = e.target.closest("[data-quick]");
      if (quick && isAdmin()) {
        const r = findRequest(quick.dataset.id);
        if (r && setStatus(r, quick.dataset.quick, state.user.name))
          afterChange(
            `${displayId(r.id)} ${quick.dataset.quick.toLowerCase()}`,
          );
        return;
      }
      const cat = e.target.closest("[data-category]");
      if (cat) {
        pendingCategory = cat.dataset.category;
        location_hash("#/new");
        return;
      }
      const open = e.target.closest("[data-open]");
      if (open) openDrawer(open.dataset.open);
    });
    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        e.target.matches("[data-open]") &&
        !e.target.matches("button, a")
      ) {
        e.preventDefault();
        openDrawer(e.target.dataset.open);
      }
      if (e.key === "Escape" && !$("drawer").hidden && $("modal").hidden)
        closeDrawer();
    });
    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerScrim").addEventListener("click", closeDrawer);
    $("drawerBody").addEventListener("click", async (e) => {
      const r = findRequest(state.openRequestId);
      if (!r) return;
      if (e.target.closest("#drawerSave") && isAdmin()) {
        const v = $("drawerStatus").value;
        if (setStatus(r, v, state.user.name))
          afterChange(`${displayId(r.id)} set to ${v}`);
        else toast("Status is unchanged");
      }
      if (e.target.closest("#drawerDelete") && isAdmin()) {
        const ok = await confirmDialog({
          title: `Delete ${displayId(r.id)}?`,
          text: "This removes the request and its history. It can’t be undone.",
        });
        if (!ok) return;
        state.requests = state.requests.filter((x) => x.id !== r.id);
        closeDrawer();
        afterChange(`${displayId(r.id)} deleted`);
      }
      if (e.target.closest("#drawerCancel") && !isAdmin()) {
        const ok = await confirmDialog({
          title: `Cancel ${displayId(r.id)}?`,
          text: "The request will be closed. You can submit a new one at any time.",
          confirmLabel: "Cancel request",
        });
        if (!ok) return;
        if (setStatus(r, "Cancelled", state.user.name))
          afterChange(`${displayId(r.id)} cancelled`);
      }
    });
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  setTheme(store.get(STORE.theme) === "dark" ? "dark" : "light");
  wire();
  setAuthMode("login");
  const saved = store.get(STORE.session);
  if (saved) {
    try {
      const p = JSON.parse(saved);
      if (p && ["admin", "user"].includes(p.role) && p.email && p.name)
        startSession(p, false);
      else store.del(STORE.session);
    } catch {
      store.del(STORE.session);
    }
  }
})();
