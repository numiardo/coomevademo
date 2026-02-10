const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const statusText = document.getElementById("status");
const consoleOutput = document.getElementById("consoleOutput");
const servicesPanel = document.getElementById("servicesPanel");
const loginCard = document.getElementById("loginCard");
const eventsButton = document.getElementById("eventsButton");
const eventsSection = document.getElementById("eventsSection");
const eventsList = document.getElementById("eventsList");
const ticketForm = document.getElementById("ticketForm");
const ticketSummary = document.getElementById("ticketSummary");

const validUser = "ecorona";
const validPassword = "E$Corona2026";
const apiUrl =
  "https://api.journeybuilder.numia.co/api/v1/run/41bdeb72-bed8-4eac-8104-9a66d6033265?stream=false";
const headers = {
  "Content-Type": "application/json",
  "x-api-key": "sk-HLG3rbzWT3umx7I1uXX16lq1szZVQjRpuSf79FhUsl8",
  Origin: "journeybuilder.numia.co",
};
const buildPayload = (message) => ({
  input_value: message,
  input_type: "chat",
});

const appendToConsole = (message) => {
  const timestamp = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  consoleOutput.textContent += `\n[${timestamp}] ${message}`;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
};

const setStatus = (message, state = "idle") => {
  statusText.textContent = message;
  statusText.classList.remove("success", "error");
  if (state === "success") {
    statusText.classList.add("success");
  }
  if (state === "error") {
    statusText.classList.add("error");
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clearEventsUI = () => {
  eventsList.innerHTML = "";
  eventsSection.classList.add("hidden");
  ticketForm.classList.add("hidden");
  ticketSummary.textContent = "";
};

const appendHumanResponse = (data) => {
  if (data && Array.isArray(data.list)) {
    appendToConsole(`<< Se encontraron ${data.list.length} eventos disponibles.`);
    data.list.forEach((event, index) => {
      appendToConsole(
        `  ${index + 1}. ${event.Title} | Convenio ${event.Convenio} | ` +
          `${event.Cantidad} cupos disponibles`
      );
    });
    return;
  }

  if (typeof data === "string") {
    appendToConsole(`<< Respuesta: ${data}`);
    return;
  }

  appendToConsole("<< Respuesta recibida correctamente.");
};

const renderEvents = (events) => {
  eventsList.innerHTML = "";
  if (!events.length) {
    eventsSection.classList.remove("hidden");
    eventsList.innerHTML =
      "<p class=\"helper\">No hay eventos disponibles por ahora.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();
  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";

    const title = document.createElement("p");
    title.className = "event-title";
    title.textContent = event.Title;

    const meta = document.createElement("div");
    meta.className = "event-meta";
    meta.innerHTML = `<span>Cupos disponibles: ${event.Cantidad}</span>
      <span>Convenio: ${event.Convenio}</span>`;

    const actions = document.createElement("div");
    actions.className = "event-actions";

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="0">Boletos</option>
      <option value="1">1 boleto</option>
      <option value="2">2 boletos</option>
    `;

    const requestButton = document.createElement("button");
    requestButton.className = "service-button";
    requestButton.type = "button";
    requestButton.textContent = "Solicitar";

    requestButton.addEventListener("click", () => {
      const quantity = Number(select.value);
      if (quantity === 0) {
        setStatus("Selecciona 1 o 2 boletos para continuar.", "error");
        return;
      }
      setStatus("Boletos seleccionados.", "success");
      ticketSummary.textContent = `Evento: ${event.Title} · ${quantity} ${
        quantity === 1 ? "boleto" : "boletos"
      }`;
      ticketForm.classList.remove("hidden");
    });

    actions.appendChild(select);
    actions.appendChild(requestButton);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    fragment.appendChild(card);
  });

  eventsSection.classList.remove("hidden");
  eventsList.appendChild(fragment);
};

const sendRequest = async (message, button, onSuccess) => {
  button.disabled = true;
  setStatus("Enviando solicitud...");
  appendToConsole(">> POST /run ...");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(buildPayload(message)),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      data = rawText;
    }

    appendToConsole(`<< Status ${response.status}`);
    appendHumanResponse(data);

    setStatus("Respuesta recibida.", "success");
    if (onSuccess) {
      onSuccess(data);
    }
  } catch (error) {
    appendToConsole(`!! Error: ${error.message}`);
    setStatus("Error al llamar la API.", "error");
  } finally {
    button.disabled = false;
  }
};

const simulateLogin = async (username, password) => {
  loginButton.disabled = true;
  setStatus("Validando credenciales...");
  consoleOutput.textContent = "Consola lista.";

  appendToConsole(">> Iniciando sesión...");
  await delay(500);
  appendToConsole(">> Conectando a NocoDB...");
  await delay(700);
  appendToConsole(">> Consultando tabla 'usuarios'...");
  await delay(700);
  appendToConsole(`>> Usuario recibido: ${username || "(vacío)"}`);
  await delay(600);
  appendToConsole(">> Comparando hash de password...");
  await delay(800);

  const isValid = username === validUser && password === validPassword;

  if (isValid) {
    appendToConsole("<< Resultado: credenciales válidas.");
    setStatus("Acceso concedido.", "success");
    servicesPanel.classList.remove("hidden");
    loginCard.classList.add("hidden");
    clearEventsUI();
  } else {
    appendToConsole("<< Resultado: credenciales inválidas.");
    setStatus("Usuario o password incorrectos.", "error");
    servicesPanel.classList.add("hidden");
    loginCard.classList.remove("hidden");
    clearEventsUI();
  }

  loginButton.disabled = false;
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  simulateLogin(usernameInput.value.trim(), passwordInput.value);
});

eventsButton.addEventListener("click", () => {
  consoleOutput.textContent = "Consola lista.";
  clearEventsUI();
  sendRequest("Conocer eventos de convenio A", eventsButton, (data) => {
    const list = data && Array.isArray(data.list) ? data.list : [];
    renderEvents(list);
  });
});

const bankCertificateButton = document.getElementById("bankCertificateButton");
bankCertificateButton.addEventListener("click", () => {
  consoleOutput.textContent = "Consola lista.";
  clearEventsUI();
  sendRequest("Solicito mi certificado bancario", bankCertificateButton);
});
