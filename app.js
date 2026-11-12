(() => {
  const form = document.querySelector("#listing-form");
  if (!form) return;

  const fields = {
    year: document.querySelector("#year"),
    makeModel: document.querySelector("#make-model"),
    mileage: document.querySelector("#mileage"),
    transmission: document.querySelector("#transmission"),
    condition: document.querySelector("#condition"),
    price: document.querySelector("#price"),
    location: document.querySelector("#location"),
  };
  const photoInput = document.querySelector("#photos");
  const photoPreviews = document.querySelector("#photo-previews");
  const formError = document.querySelector("#form-error");
  const progressBar = document.querySelector("#progress-bar");
  const formActions = document.querySelector(".form-actions");
  const uploadRow = document.querySelector(".upload-row");
  const result = document.querySelector("#draft-result");
  const panelTitle = document.querySelector("#panel-title");
  const sampleButton = document.querySelector("#sample-button");
  const editButton = document.querySelector("#edit-button");
  const approveButton = document.querySelector("#approve-button");
  const resetButton = document.querySelector("#reset-button");
  const draftPhotos = document.querySelector("#draft-photos");
  const photoUrls = [];

  function revokePhotos() {
    for (const url of photoUrls.splice(0)) URL.revokeObjectURL(url);
    photoPreviews.replaceChildren();
    draftPhotos.replaceChildren();
    photoInput.value = "";
  }

  function selectedPhotos() {
    return [...photoInput.files].filter((file) => file.type.startsWith("image/")).slice(0, 4);
  }

  function showPhotoPreviews() {
    revokePhotos();
    const files = selectedPhotos();
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      photoUrls.push(url);
      const preview = document.createElement("img");
      preview.className = "photo-preview";
      preview.src = url;
      preview.alt = "Selected vehicle photo preview";
      photoPreviews.append(preview);
    });
    if (files.length) {
      const count = document.createElement("span");
      count.className = "photo-count";
      count.textContent = `${files.length} / 4`;
      photoPreviews.append(count);
    }
  }

  function renderDraftPhotos() {
    draftPhotos.replaceChildren();
    const files = selectedPhotos();
    if (!files.length) {
      for (let index = 0; index < 3; index += 1) {
        const placeholder = document.createElement("div");
        placeholder.className = "draft-photo";
        placeholder.setAttribute("aria-label", "No photo added");
        draftPhotos.append(placeholder);
      }
      return;
    }
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      photoUrls.push(url);
      const image = document.createElement("img");
      image.className = "draft-photo";
      image.src = url;
      image.alt = "Seller-provided vehicle photo";
      draftPhotos.append(image);
    });
  }

  function valueOf(field) {
    return field.value.trim();
  }

  function escapeText(text) {
    return text.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function showError(message) {
    formError.textContent = message;
    const invalid = form.querySelector(":invalid");
    if (invalid) invalid.focus();
  }

  function fillSample() {
    fields.year.value = "2020";
    fields.makeModel.value = "Suzuki Swift GL";
    fields.mileage.value = "62,000 km";
    fields.transmission.value = "Manual";
    fields.condition.value = "Good";
    fields.price.value = "R145,000";
    fields.location.value = "Cape Town";
    formError.textContent = "";
    updateProgress();
    fields.year.focus();
  }

  function updateProgress() {
    const required = [fields.year, fields.makeModel, fields.mileage, fields.transmission, fields.condition, fields.location];
    const complete = required.filter((field) => field.value.trim()).length;
    progressBar.style.width = `${Math.max(14, Math.round((complete / required.length) * 100))}%`;
  }

  function createDraft() {
    const year = valueOf(fields.year);
    if (!/^(18|19|20|21)\d{2}$/.test(year) || Number(year) > new Date().getFullYear() + 1) {
      showError("Enter a valid model year to continue.");
      return;
    }
    for (const [key, field] of Object.entries(fields)) {
      if (key !== "price" && !valueOf(field)) {
        showError("Please complete each vehicle detail, or leave only the asking price blank.");
        return;
      }
    }
    formError.textContent = "";
    const data = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, valueOf(field)]));
    const price = data.price ? `The asking price is ${data.price}.` : "The seller can add an asking price when ready.";
    document.querySelector("#draft-title").textContent = `${data.year} ${data.makeModel}`;
    document.querySelector("#draft-facts").innerHTML = [
      data.mileage,
      data.transmission,
      data.condition,
      data.price || "Price to be added",
      data.location,
    ].map((fact) => `<span class="fact-chip">${escapeText(fact)}</span>`).join("");
    document.querySelector("#draft-copy").textContent =
      `${data.year} ${data.makeModel} for sale in ${data.location}. ` +
      `The vehicle has ${data.mileage}, a ${data.transmission.toLowerCase()} transmission, ` +
      `and is described by the seller as being in ${data.condition.toLowerCase()} condition. ` +
      `${price} Get in touch to find out more or arrange a viewing.`;
    renderDraftPhotos();
    form.hidden = true;
    formActions.hidden = true;
    uploadRow.hidden = true;
    result.hidden = false;
    panelTitle.textContent = "Your draft is ready";
    progressBar.style.width = "100%";
    document.querySelector("#approval-state").hidden = true;
    approveButton.disabled = false;
    approveButton.classList.remove("approve-button-done");
    approveButton.innerHTML = 'Approve this draft <span aria-hidden="true">→</span>';
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  photoInput.addEventListener("change", showPhotoPreviews);
  Object.values(fields).forEach((field) => field.addEventListener("input", updateProgress));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    createDraft();
  });
  sampleButton.addEventListener("click", fillSample);
  editButton.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    formActions.hidden = false;
    uploadRow.hidden = false;
    panelTitle.textContent = "Edit your vehicle details";
    document.querySelector("#approval-state").hidden = true;
    updateProgress();
    fields.year.focus();
  });
  approveButton.addEventListener("click", () => {
    document.querySelector("#approval-state").hidden = false;
    approveButton.disabled = true;
    approveButton.classList.add("approve-button-done");
    approveButton.textContent = "Approved in this demo";
  });
  resetButton.addEventListener("click", () => {
    form.reset();
    revokePhotos();
    result.hidden = true;
    form.hidden = false;
    formActions.hidden = false;
    uploadRow.hidden = false;
    formError.textContent = "";
    panelTitle.textContent = "Tell us about the car";
    progressBar.style.width = "32%";
    fields.year.focus();
  });
})();
