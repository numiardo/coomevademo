const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const statusText = document.getElementById("status");
const consoleOutput = document.getElementById("consoleOutput");
const servicesPanel = document.getElementById("servicesPanel");
const loginCard = document.getElementById("loginCard");
const eventsButton = document.getElementById("eventsButton");
const eventsSection = document.getElementById("eventsSection");
const eventsList = document.getElementById("eventsList");
const ticketForm = document.getElementById("ticketForm");
const userWelcome = document.getElementById("userWelcome");
const servicesStep = document.getElementById("servicesStep");
const orderSummary = document.getElementById("orderSummary");
const orderSummaryStep = document.getElementById("orderSummaryStep");
const bankCertificateStep = document.getElementById("bankCertificateStep");
const cedulaInput = document.getElementById("cedulaInput");
const validateCedulaButton = document.getElementById("validateCedulaButton");
const backToServicesFromBank = document.getElementById("backToServicesFromBank");
const bankDownloadLink = document.getElementById("bankDownloadLink");
const bankDeliveryStep = document.getElementById("bankDeliveryStep");
const bankEmailButton = document.getElementById("bankEmailButton");
const backToCedula = document.getElementById("backToCedula");
const backToServices = document.getElementById("backToServices");
const ticketContinueButton = document.getElementById("ticketContinueButton");
const backToEventsFromForm = document.getElementById("backToEventsFromForm");
const backToTicketForm = document.getElementById("backToTicketForm");
const finalizeButton = document.getElementById("finalizeButton");
const finishModal = document.getElementById("finishModal");
const goHomeButton = document.getElementById("goHomeButton");
const logoutButton = document.getElementById("logoutButton");
const infoNombre = document.getElementById("infoNombre");
const infoApellido = document.getElementById("infoApellido");
const infoConvenio = document.getElementById("infoConvenio");
const infoEmail = document.getElementById("infoEmail");
const infoCelular = document.getElementById("infoCelular");

let currentUser = null;
let lastTicketSummary = "";

const nocodbUrl =
  "https://app.nocodb.com/api/v2/tables/m4symnb2tkhsjsp/records";
const nocodbParams = new URLSearchParams({
  offset: "0",
  limit: "25",
  where: "",
  viewId: "vw29mj4ippgv0pa3",
});
const nocodbHeaders = {
  "xc-token": "wzMrg3l9g4W0EdRJva3wFwRqVBWmtPmBg2xbtbP8",
};
const eventsUrl =
  "https://app.nocodb.com/api/v2/tables/mzaewip7abz56p8/records";
const eventsParams = new URLSearchParams({
  offset: "0",
  limit: "25",
  where: "",
  viewId: "vw026n6f337qhhz8",
});
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

const showStep = (step) => {
  servicesStep.classList.add("hidden");
  eventsSection.classList.add("hidden");
  ticketForm.classList.add("hidden");
  orderSummaryStep.classList.add("hidden");
  bankCertificateStep.classList.add("hidden");
  bankDeliveryStep.classList.add("hidden");

  if (step === "services") {
    servicesStep.classList.remove("hidden");
  }
  if (step === "events") {
    eventsSection.classList.remove("hidden");
  }
  if (step === "ticketForm") {
    ticketForm.classList.remove("hidden");
  }
  if (step === "orderSummary") {
    orderSummaryStep.classList.remove("hidden");
  }
  if (step === "bankCertificate") {
    bankCertificateStep.classList.remove("hidden");
  }
  if (step === "bankDelivery") {
    bankDeliveryStep.classList.remove("hidden");
  }
};

const openModal = () => {
  finishModal.classList.remove("hidden");
  finishModal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  finishModal.classList.add("hidden");
  finishModal.setAttribute("aria-hidden", "true");
};

const resetFlow = () => {
  clearEventsUI();
  showStep("services");
};

const logout = () => {
  currentUser = null;
  clearEventsUI();
  servicesPanel.classList.add("hidden");
  loginCard.classList.remove("hidden");
};

const normalizeConvenio = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim().toUpperCase();
  if (trimmed.includes("A")) return "A";
  if (trimmed.includes("B")) return "B";
  return trimmed;
};

const updateUserUI = (user) => {
  const convenioText = user.Convenio ? user.Convenio : "Sin convenio";
  if (userWelcome) {
    userWelcome.textContent = `Bienvenido, ${user["User Name"]} ${user.Lastname} (${convenioText})`;
  }
  if (infoNombre) {
    infoNombre.textContent = user["User Name"] || "-";
  }
  if (infoApellido) {
    infoApellido.textContent = user.Lastname || "-";
  }
  if (infoConvenio) {
    infoConvenio.textContent = convenioText;
  }
  if (infoEmail) {
    infoEmail.textContent = user.Email || "-";
  }
  if (infoCelular) {
    infoCelular.textContent = user.Celular || "-";
  }
};

const fetchUsers = async () => {
  const response = await fetch(`${nocodbUrl}?${nocodbParams.toString()}`, {
    method: "GET",
    headers: nocodbHeaders,
  });
  if (!response.ok) {
    throw new Error("No se pudo consultar NocoDB.");
  }
  const data = await response.json();
  return Array.isArray(data.list) ? data.list : [];
};

const fetchEvents = async () => {
  const response = await fetch(`${eventsUrl}?${eventsParams.toString()}`, {
    method: "GET",
    headers: nocodbHeaders,
  });
  if (!response.ok) {
    throw new Error("No se pudo consultar los eventos.");
  }
  const data = await response.json();
  return Array.isArray(data.list) ? data.list : [];
};

const clearEventsUI = () => {
  eventsList.innerHTML = "";
  lastTicketSummary = "";
  if (orderSummary) {
    orderSummary.textContent = "";
  }
  if (cedulaInput) {
    cedulaInput.value = "";
  }
};

const appendHumanResponse = (data) => {
  if (data && Array.isArray(data.list)) {
    appendToConsole(`<< Se encontraron ${data.list.length} eventos en total.`);
    data.list.slice(0, 6).forEach((event, index) => {
      appendToConsole(
        `  ${index + 1}. ${event.Title} | Convenio ${event.Convenio} | ` +
          `${event.Cantidad} cupos | Precio ${event.Precio || "N/A"}`
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

const renderEvents = (events, convenio) => {
  eventsList.innerHTML = "";
  const normalizedConvenio = normalizeConvenio(convenio);
  const filteredEvents = events.filter(
    (event) =>
      normalizeConvenio(event.Convenio) === normalizedConvenio ||
      normalizedConvenio === ""
  );

  showStep("events");
  if (!filteredEvents.length) {
    eventsSection.classList.remove("hidden");
    eventsList.innerHTML =
      "<tr><td colspan=\"6\" class=\"helper\">No hay eventos disponibles para tu convenio.</td></tr>";
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredEvents.forEach((event) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = event.Title;

    const countCell = document.createElement("td");
    countCell.textContent = event.Cantidad;

    const convenioCell = document.createElement("td");
    convenioCell.textContent = event.Convenio;

    const priceCell = document.createElement("td");
    priceCell.textContent = event.Precio || "N/A";

    const selectCell = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
    `;
    selectCell.appendChild(select);

    const actionCell = document.createElement("td");
    const requestButton = document.createElement("button");
    requestButton.className = "service-button";
    requestButton.type = "button";
    requestButton.textContent = "Solicitar";
    actionCell.appendChild(requestButton);

    requestButton.addEventListener("click", () => {
      const quantity = Number(select.value);
      if (quantity === 0) {
        setStatus("Selecciona 1 o 2 boletos para continuar.", "error");
        return;
      }
      if (!currentUser) {
        setStatus("Inicia sesión para continuar.", "error");
        return;
      }
      setStatus("Boletos seleccionados.", "success");
      lastTicketSummary = `Evento: ${event.Title} · ${quantity} ${
        quantity === 1 ? "boleto" : "boletos"
      } · Precio ${event.Precio || "N/A"}`;
      updateUserUI(currentUser);
      if (orderSummary) {
        orderSummary.textContent = lastTicketSummary;
      }
      showStep("ticketForm");
    });

    row.appendChild(titleCell);
    row.appendChild(countCell);
    row.appendChild(convenioCell);
    row.appendChild(priceCell);
    row.appendChild(selectCell);
    row.appendChild(actionCell);
    fragment.appendChild(row);
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
  await delay(400);
  appendToConsole(">> Conectando a NocoDB...");
  await delay(400);
  appendToConsole(">> Consultando usuarios disponibles...");

  try {
    const users = await fetchUsers();
    appendToConsole(`>> Usuarios consultados: ${users.length}`);
    appendToConsole(`>> Usuario recibido: ${username || "(vacío)"}`);
    await delay(400);
    appendToConsole(">> Verificando credenciales...");

    const matchedUser = users.find(
      (user) => user.User === username && user.Password === password
    );

    if (matchedUser) {
      appendToConsole("<< Resultado: credenciales válidas.");
      setStatus("Acceso concedido.", "success");
      currentUser = matchedUser;
      servicesPanel.classList.remove("hidden");
      loginCard.classList.add("hidden");
      clearEventsUI();
      showStep("services");
    } else {
      appendToConsole("<< Resultado: credenciales inválidas.");
      setStatus("Usuario o password incorrectos.", "error");
      servicesPanel.classList.add("hidden");
      loginCard.classList.remove("hidden");
      clearEventsUI();
      currentUser = null;
    }
  } catch (error) {
    appendToConsole(`!! Error: ${error.message}`);
    setStatus("No se pudo validar el login.", "error");
    servicesPanel.classList.add("hidden");
    loginCard.classList.remove("hidden");
    clearEventsUI();
    currentUser = null;
  } finally {
    loginButton.disabled = false;
  }

};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  simulateLogin(usernameInput.value.trim(), passwordInput.value);
});

backToServices.addEventListener("click", () => {
  clearEventsUI();
  showStep("services");
});

backToServicesFromBank.addEventListener("click", () => {
  clearEventsUI();
  showStep("services");
});

backToCedula.addEventListener("click", () => {
  showStep("bankCertificate");
});

if (ticketContinueButton) {
  ticketContinueButton.addEventListener("click", () => {
    appendToConsole(">> Mostrando resumen del pedido...");
    showStep("orderSummary");
  });
}

backToEventsFromForm.addEventListener("click", () => {
  showStep("events");
});

backToTicketForm.addEventListener("click", () => {
  showStep("ticketForm");
});

validateCedulaButton.addEventListener("click", async () => {
  const cedula = cedulaInput.value.trim();
  if (!cedula) {
    setStatus("Ingresa tu cédula para continuar.", "error");
    return;
  }
  setStatus("Validando cédula...");
  appendToConsole(">> Validando cédula en NocoDB...");

  try {
    let userToValidate = currentUser;
    if (!userToValidate || !userToValidate.Cedula) {
      const users = await fetchUsers();
      userToValidate = users.find(
        (user) => user.User === (currentUser ? currentUser.User : "")
      );
    }

    const isValid = userToValidate && String(userToValidate.Cedula) === cedula;
    if (!isValid) {
      setStatus("La cédula no coincide.", "error");
      appendToConsole("<< Cédula no válida.");
      return;
    }

    setStatus("Cédula validada.", "success");
    appendToConsole("<< Cédula validada.");
    showStep("bankDelivery");
  } catch (error) {
    appendToConsole(`!! Error: ${error.message}`);
    setStatus("No se pudo validar la cédula.", "error");
  }
});

bankEmailButton.addEventListener("click", () => {
  setStatus("Envío por email solicitado.", "success");
  appendToConsole("<< Certificado enviado por email.");
  openModal();
});

finalizeButton.addEventListener("click", () => {
  openModal();
});

goHomeButton.addEventListener("click", () => {
  closeModal();
  resetFlow();
});

logoutButton.addEventListener("click", () => {
  closeModal();
  logout();
});

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Ocultar" : "Ver";
});

eventsButton.addEventListener("click", () => {
  consoleOutput.textContent = "Consola lista.";
  clearEventsUI();
  showStep("events");
  eventsButton.disabled = true;
  setStatus("Consultando eventos...");
  appendToConsole(">> Solicitando eventos disponibles...");
  fetchEvents()
    .then((events) => {
      const convenio = currentUser ? currentUser.Convenio : "";
      const filteredEvents = events.filter(
        (event) =>
          normalizeConvenio(event.Convenio) === normalizeConvenio(convenio) ||
          normalizeConvenio(convenio) === ""
      );
      appendToConsole(
        `<< Eventos encontrados para tu convenio: ${filteredEvents.length}`
      );
      renderEvents(events, convenio);
      setStatus("Eventos cargados.", "success");
    })
    .catch((error) => {
      appendToConsole(`!! Error: ${error.message}`);
      setStatus("No se pudieron cargar los eventos.", "error");
    })
    .finally(() => {
      eventsButton.disabled = false;
    });
});

const bankCertificateButton = document.getElementById("bankCertificateButton");
bankCertificateButton.addEventListener("click", () => {
  consoleOutput.textContent = "Consola lista.";
  clearEventsUI();
  showStep("bankCertificate");
});
