const storageKeys = {
  customProducts: "nf-solicitacao-custom-products",
  customSapReferences: "nf-solicitacao-custom-sap-references",
  customTransportadoras: "nf-solicitacao-custom-transportadoras",
};

const summaryFields = {
  origem: document.getElementById("origem"),
  destino: document.getElementById("destino"),
  volumes: document.getElementById("volumes"),
  pesoTotalGeral: document.getElementById("peso-total-geral"),
  transportadora: document.getElementById("transportadora"),
  assuntoEmail: document.getElementById("assunto-email"),
  emailDestinatario: document.getElementById("email-destinatario"),
};

const referenceLists = {
  origem: document.getElementById("origens-list"),
  destino: document.getElementById("destinos-list"),
  transportadora: document.getElementById("transportadoras-list"),
  produtosSap: document.getElementById("produtos-sap-list"),
};

const productsList = document.getElementById("products-list");
const productTemplate = document.getElementById("product-template");
const preview = document.getElementById("request-preview");
const addProductButton = document.getElementById("add-product");
const sendEmailButton = document.getElementById("send-email");
const openSapModalButton = document.getElementById("open-sap-modal");
const openTransportadoraModalButton = document.getElementById("open-transportadora-modal");
const sapModal = document.getElementById("sap-modal");
const sapForm = document.getElementById("sap-form");
const closeSapModalButton = document.getElementById("close-sap-modal");
const cancelSapModalButton = document.getElementById("cancel-sap-modal");
const sapModalFeedback = document.getElementById("sap-modal-feedback");
const sapRegisteredList = document.getElementById("sap-registered-list");
const transportadoraModal = document.getElementById("transportadora-modal");
const transportadoraForm = document.getElementById("transportadora-form");
const closeTransportadoraModalButton = document.getElementById("close-transportadora-modal");
const cancelTransportadoraModalButton = document.getElementById("cancel-transportadora-modal");
const transportadoraModalFeedback = document.getElementById("transportadora-modal-feedback");
const transportadoraRegisteredList = document.getElementById("transportadora-registered-list");
const openProductModalButton = document.getElementById("open-product-modal");
const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");
const closeProductModalButton = document.getElementById("close-product-modal");
const cancelProductModalButton = document.getElementById("cancel-product-modal");
const modalFeedback = document.getElementById("modal-feedback");
const productRegisteredList = document.getElementById("product-registered-list");
const modalValorUnitarioInput = document.getElementById("modal-valor-unitario");

const baseLocationCatalog = {
  sapReferences: [
    { codigo: "BR01", descricao: "MATRIZ" },
    { codigo: "BR02", descricao: "BARUERI" },
    { codigo: "BR03", descricao: "RECIFE" },
    { codigo: "BR10", descricao: "CURITIBA" },
    { codigo: "BR11", descricao: "JOINVILLE" },
    { codigo: "BR12", descricao: "PORTO ALEGRE" },
  ],
  transportadora: [
    { codigo: "3001671", descricao: "BRASPRESS" },
    { codigo: "3001820", descricao: "JADLOG" },
    { codigo: "3001900", descricao: "TOTAL EXPRESS" },
  ],
};

const baseProductCatalog = {
  "831811": {
    descricaoProduto: "SmartPhone Samsung",
    valorUnitario: "1900",
  },
  "832072": {
    descricaoProduto: "Monitor DELL 2208WFPt",
    valorUnitario: "5900",
  },
  "833834": {
    descricaoProduto: "Lenovo ThinkPad E14",
    valorUnitario: "9000",
  },
  "834426": {
    descricaoProduto: "Notebook Dell Latitude",
    valorUnitario: "9000",
  },
  "836550": {
    descricaoProduto: "Impressora SL-M4080FX",
    valorUnitario: "6000",
  },
  "839058": {
    descricaoProduto: "codigo para chip",
    valorUnitario: "20",
  },
};

const initialProducts = [{}];

let customProductCatalog = loadCustomProducts();
let customSapReferences = loadCustomSapReferences();
let customTransportadoras = loadCustomTransportadoras();
let locationCatalog = mergeLocationCatalogs(baseLocationCatalog, customSapReferences, customTransportadoras);
let productCatalog = mergeProductCatalogs(baseProductCatalog, customProductCatalog);
let editingSapCode = null;
let editingTransportadoraCode = null;
let editingProductCode = null;

function mergeCatalogs(baseCatalog, customCatalog) {
  return {
    ...baseCatalog,
    ...customCatalog,
  };
}

function mergeProductCatalogs(baseCatalog, customCatalog) {
  const mergedCatalog = { ...baseCatalog };

  (customCatalog.removedCodes || []).forEach((code) => {
    delete mergedCatalog[code];
  });

  return {
    ...mergedCatalog,
    ...(customCatalog.products || {}),
  };
}

function loadCustomProducts() {
  try {
    const rawValue = window.localStorage.getItem(storageKeys.customProducts);

    if (!rawValue) {
      return { products: {}, removedCodes: [] };
    }

    const parsedValue = JSON.parse(rawValue);
    if (typeof parsedValue === "object" && parsedValue) {
      if (parsedValue.products || parsedValue.removedCodes) {
        return {
          products: typeof parsedValue.products === "object" && parsedValue.products ? parsedValue.products : {},
          removedCodes: Array.isArray(parsedValue.removedCodes) ? parsedValue.removedCodes : [],
        };
      }

      return {
        products: parsedValue,
        removedCodes: [],
      };
    }

    return { products: {}, removedCodes: [] };
  } catch (error) {
    return { products: {}, removedCodes: [] };
  }
}

function mergeLocationCatalogs(baseCatalog, customCatalog, customTransportadoraCatalog) {
  const mergedSapReferences = dedupeSapReferences([
    ...baseCatalog.sapReferences.filter((item) => !customCatalog.removedCodes.includes(item.codigo)),
    ...customCatalog.sapReferences,
  ]);
  const mergedTransportadoras = dedupeSapReferences([
    ...baseCatalog.transportadora.filter((item) => !customTransportadoraCatalog.removedCodes.includes(item.codigo)),
    ...customTransportadoraCatalog.transportadoras,
  ]);

  const mergedCatalog = {
    origem: mergedSapReferences,
    destino: mergedSapReferences,
    transportadora: mergedTransportadoras,
  };

  return mergedCatalog;
}

function dedupeSapReferences(items) {
  const seenCodes = new Set();

  return items.filter((item) => {
    if (!item?.codigo || seenCodes.has(item.codigo)) {
      return false;
    }

    seenCodes.add(item.codigo);
    return true;
  });
}

function loadCustomSapReferences() {
  try {
    const rawValue = window.localStorage.getItem(storageKeys.customSapReferences);

    if (!rawValue) {
      return { sapReferences: [], removedCodes: [] };
    }

    const parsedValue = JSON.parse(rawValue);
    const legacyItems = [
      ...(Array.isArray(parsedValue.origem) ? parsedValue.origem : []),
      ...(Array.isArray(parsedValue.destino) ? parsedValue.destino : []),
    ];
    const sapReferences = Array.isArray(parsedValue.sapReferences)
      ? parsedValue.sapReferences
      : legacyItems;

    return {
      sapReferences: dedupeSapReferences(sapReferences),
      removedCodes: Array.isArray(parsedValue.removedCodes) ? parsedValue.removedCodes : [],
    };
  } catch (error) {
    return { sapReferences: [], removedCodes: [] };
  }
}

function persistCustomSapReferences() {
  window.localStorage.setItem(
    storageKeys.customSapReferences,
    JSON.stringify(customSapReferences),
  );
}

function loadCustomTransportadoras() {
  try {
    const rawValue = window.localStorage.getItem(storageKeys.customTransportadoras);

    if (!rawValue) {
      return { transportadoras: [], removedCodes: [] };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      transportadoras: dedupeSapReferences(
        Array.isArray(parsedValue.transportadoras) ? parsedValue.transportadoras : [],
      ),
      removedCodes: Array.isArray(parsedValue.removedCodes) ? parsedValue.removedCodes : [],
    };
  } catch (error) {
    return { transportadoras: [], removedCodes: [] };
  }
}

function persistCustomTransportadoras() {
  window.localStorage.setItem(
    storageKeys.customTransportadoras,
    JSON.stringify(customTransportadoras),
  );
}

function persistCustomProducts() {
  window.localStorage.setItem(
    storageKeys.customProducts,
    JSON.stringify(customProductCatalog),
  );
}

function formatCurrency(value) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

function normalizeCurrencyValue(value) {
  const sanitizedValue = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numericValue = Number(sanitizedValue);
  return Number.isNaN(numericValue) ? "0" : String(numericValue);
}

function formatCurrencyInput(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const numericValue = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatQuantity(value) {
  const numericValue = Number(value || 0);
  return String(numericValue).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatReferenceOption(item) {
  return `${item.codigo} - ${item.descricao}`;
}

function populateReferenceList(type, items) {
  referenceLists[type].innerHTML = items
    .map((item) => `<option value="${escapeHtml(formatReferenceOption(item))}"></option>`)
    .join("");
}

function initializeReferenceLists() {
  populateReferenceList("origem", locationCatalog.origem);
  populateReferenceList("destino", locationCatalog.destino);
  populateReferenceList("transportadora", locationCatalog.transportadora);
  populateProductReferenceList();
}

function populateProductReferenceList() {
  const productOptions = Object.entries(productCatalog)
    .sort(([codeA], [codeB]) => codeA.localeCompare(codeB))
    .map(([codigoSap, product]) => {
      const label = `${codigoSap} - ${product.descricaoProduto}`;
      return `<option value="${escapeHtml(codigoSap)}" label="${escapeHtml(label)}"></option>`;
    })
    .join("");

  referenceLists.produtosSap.innerHTML = productOptions;
}

function getProducts() {
  return Array.from(productsList.querySelectorAll(".product-card")).map((card) => {
    const inputs = card.querySelectorAll("[data-field]");
    const product = {};

    inputs.forEach((input) => {
      const fieldName = input.dataset.field;
      const inputValue = input.value.trim();

      if (fieldName === "valorUnitario") {
        product[fieldName] = normalizeCurrencyValue(inputValue);
        return;
      }

      if (fieldName === "pesoTotal") {
        product[fieldName] = normalizeWeightInputValue(inputValue);
        return;
      }

      product[fieldName] = inputValue;
    });

    return product;
  });
}

function parseWeightParts(value) {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase()
    .replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/^(\d+(?:\.\d+)?)\s*(kg|g)$/i);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return {
    numericValue,
    unit,
  };
}

function parseWeightToGrams(value) {
  const weightParts = parseWeightParts(value);

  if (!weightParts) {
    return 0;
  }

  if (weightParts.unit === "kg") {
    return weightParts.numericValue * 1000;
  }

  // Regra operacional do formulario: valores decimais digitados com "g"
  // sao tratados como kg para refletir o uso esperado pelos solicitantes.
  if (weightParts.unit === "g" && !Number.isInteger(weightParts.numericValue)) {
    return weightParts.numericValue * 1000;
  }

  return weightParts.numericValue;
}

function normalizeWeightInputValue(value) {
  const weightParts = parseWeightParts(value);

  if (!weightParts) {
    return String(value || "").trim();
  }

  const formattedNumber = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: Number.isInteger(weightParts.numericValue) ? 0 : 1,
    maximumFractionDigits: 3,
  }).format(weightParts.numericValue);

  if (weightParts.unit === "g" && !Number.isInteger(weightParts.numericValue)) {
    return `${formattedNumber} kg`;
  }

  return `${formattedNumber} ${weightParts.unit}`;
}

function updateWeightStatus(card) {
  const weightInput = card.querySelector('[data-field="pesoTotal"]');
  const status = card.querySelector('[data-role="weight-status"]');
  const rawValue = String(weightInput.value || "").trim();

  status.classList.remove("is-warning");

  if (!rawValue) {
    status.textContent = "";
    return;
  }

  if (!parseWeightParts(rawValue)) {
    status.textContent = "Formato de peso invalido. Use exemplos como 500 g, 0,5 g, 1 kg ou 1,25 kg.";
    status.classList.add("is-warning");
    return;
  }

  status.textContent = "";
}

function formatWeightFromGrams(totalGrams) {
  if (!totalGrams) {
    return "0 g";
  }

  if (totalGrams >= 1000) {
    const kilograms = totalGrams / 1000;
    return `${new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: Number.isInteger(kilograms) ? 0 : 1,
      maximumFractionDigits: 4,
    }).format(kilograms)} kg`;
  }

  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: Number.isInteger(totalGrams) ? 0 : 1,
    maximumFractionDigits: 3,
  }).format(totalGrams)} g`;
}

function getTotalWeight() {
  const totalGrams = getProducts().reduce(
    (sum, product) => sum + parseWeightToGrams(product.pesoTotal),
    0,
  );

  return formatWeightFromGrams(totalGrams);
}

function buildEmailIntroHtml() {
  return `
    <section class="email-message">
      <p>Prezados,</p>
      <p>Tudo bem?</p>
      <p style="margin-top:18px;">
        Por favor poderiam emitir uma NF para que possamos transportar o material,
        que esta em <strong><em>${escapeHtml(extrairCidade(summaryFields.origem.value) || "-")}</em></strong>
        para <strong><em>${escapeHtml(extrairCidade(summaryFields.destino.value) || "-")}</em></strong>, sera
        <strong><em>${escapeHtml(formatQuantity(summaryFields.volumes.value || "0"))} volume.</em></strong>
      </p>
      <p style="margin-top:18px;"><strong><em>Segue dados:</em></strong></p>
    </section>
  `;
}

function buildEmailIntroText() {
  return [
    "Prezados,",
    "Tudo bem?",
    "",
    `Por favor poderiam emitir uma NF para que possamos transportar o material, que esta em ${extrairCidade(summaryFields.origem.value) || "-"} para ${extrairCidade(summaryFields.destino.value) || "-"}, sera ${formatQuantity(summaryFields.volumes.value || "0")} volume.`,
    "",
    "Segue dados:",
    "",
  ].join("\n");
}

function buildSummaryTable() {
  const totalWeight = getTotalWeight();

  return `
    <table class="nf-table summary">
      <tbody>
        <tr>
          <td>Origem (cod. SAP)</td>
          <td>${escapeHtml(summaryFields.origem.value)}</td>
        </tr>
        <tr>
          <td>Destino (cod. SAP)</td>
          <td>${escapeHtml(summaryFields.destino.value)}</td>
        </tr>
        <tr>
          <td>Total de Volumes</td>
          <td>${escapeHtml(summaryFields.volumes.value)}</td>
        </tr>
        <tr>
          <td>Peso Total</td>
          <td>${escapeHtml(totalWeight)}</td>
        </tr>
        <tr>
          <td>Transportadora (cod. SAP)</td>
          <td>${escapeHtml(summaryFields.transportadora.value)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildProductTable(product, index) {
  const patrimonio = product.codigoPatrimonio?.trim() ? product.codigoPatrimonio : "--------";

  return `
    <table class="nf-table">
      <thead>
        <tr>
          <th>Descricao</th>
          <th>Produto ${index + 1}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Produto (cod. SAP)</td>
          <td>${escapeHtml(product.codigoSap || "-")}</td>
        </tr>
        <tr>
          <td>Descricao Produto</td>
          <td>${escapeHtml(product.descricaoProduto || "-")}</td>
        </tr>
        <tr>
          <td>Quantidade</td>
          <td>${escapeHtml(formatQuantity(product.quantidade))}</td>
        </tr>
        <tr>
          <td>Valor Unitario (R$)</td>
          <td>${escapeHtml(formatCurrency(product.valorUnitario))}</td>
        </tr>
        <tr>
          <td>Peso</td>
          <td>${escapeHtml(product.pesoTotal || "-")}</td>
        </tr>
        <tr>
          <td>Codigo Patrimonio</td>
          <td>${escapeHtml(patrimonio)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildEmailDetailsHtml() {
  const products = getProducts();
  const summaryLines = [
    ["Origem (cod. SAP)", summaryFields.origem.value || "-"],
    ["Destino (cod. SAP)", summaryFields.destino.value || "-"],
    ["Total de Volumes", summaryFields.volumes.value || "-"],
    ["Peso Total", getTotalWeight()],
    ["Transportadora (cod. SAP)", summaryFields.transportadora.value || "-"],
  ]
    .map(
      ([label, value]) => `<div><span class="email-line-label">${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`,
    )
    .join("");

  const productBlocks = products
    .map((product, index) => {
      const patrimonio = product.codigoPatrimonio?.trim() ? product.codigoPatrimonio : "--------";

      return `
        <section class="email-lines">
          <div class="email-product-title">Produto ${index + 1}</div>
          <div><span class="email-line-label">Produto (cod. SAP):</span> ${escapeHtml(product.codigoSap || "-")}</div>
          <div><span class="email-line-label">Descricao Produto:</span> ${escapeHtml(product.descricaoProduto || "-")}</div>
          <div><span class="email-line-label">Quantidade:</span> ${escapeHtml(formatQuantity(product.quantidade))}</div>
          <div><span class="email-line-label">Valor Unitario (R$):</span> ${escapeHtml(formatCurrency(product.valorUnitario).replace("R$", "").trim())}</div>
          <div><span class="email-line-label">Peso:</span> ${escapeHtml(product.pesoTotal || "-")}</div>
          <div><span class="email-line-label">Codigo Patrimonio:</span> ${escapeHtml(patrimonio)}</div>
        </section>
      `;
    })
    .join("");

  return `
    <section class="email-block">
      <div class="email-lines summary-lines">${summaryLines}</div>
      ${productBlocks}
    </section>
  `;
}

function buildEmailHtmlBody() {
  const products = getProducts();
  const productBlocks = products
    .map((product, index) => {
      const patrimonio = product.codigoPatrimonio?.trim() ? product.codigoPatrimonio : "--------";
      return `
        <div style="margin-top:18px;">
          <div style="font-weight:700; font-style:italic;">Produto ${index + 1}</div>
          <div><span style="font-weight:700; font-style:italic;">Produto (cod. SAP):</span> ${escapeHtml(product.codigoSap || "-")}</div>
          <div><span style="font-weight:700; font-style:italic;">Descricao Produto:</span> ${escapeHtml(product.descricaoProduto || "-")}</div>
          <div><span style="font-weight:700; font-style:italic;">Quantidade:</span> ${escapeHtml(formatQuantity(product.quantidade))}</div>
          <div><span style="font-weight:700; font-style:italic;">Valor Unitario (R$):</span> ${escapeHtml(formatCurrency(product.valorUnitario).replace("R$", "").trim())}</div>
          <div><span style="font-weight:700; font-style:italic;">Peso:</span> ${escapeHtml(product.pesoTotal || "-")}</div>
          <div><span style="font-weight:700; font-style:italic;">Codigo Patrimonio:</span> ${escapeHtml(patrimonio)}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color:#2a241f; font-size:14px; line-height:1.6;">
      <p style="margin:0;">Prezados,</p>
      <p style="margin:0;">Tudo bem?</p>
      <p style="margin:18px 0 0 0;">
        Por favor poderiam emitir uma NF para que possamos transportar o material,
        que esta em <strong><em>${escapeHtml(extrairCidade(summaryFields.origem.value) || "-")}</em></strong>
        para <strong><em>${escapeHtml(extrairCidade(summaryFields.destino.value) || "-")}</em></strong>, sera
        <strong><em>${escapeHtml(formatQuantity(summaryFields.volumes.value || "0"))} volume.</em></strong>
      </p>
      <p style="margin:18px 0 0 0;"><strong><em>Segue dados:</em></strong></p>
      <div style="margin-top:18px; font-family:Aptos, 'Segoe UI', sans-serif; font-size:12pt; line-height:1.35;">
        <div><span style="font-weight:700; font-style:italic;">Origem (cod. SAP):</span> ${escapeHtml(summaryFields.origem.value || "-")}</div>
        <div><span style="font-weight:700; font-style:italic;">Destino (cod. SAP):</span> ${escapeHtml(summaryFields.destino.value || "-")}</div>
        <div><span style="font-weight:700; font-style:italic;">Total de Volumes:</span> ${escapeHtml(summaryFields.volumes.value || "-")}</div>
        <div><span style="font-weight:700; font-style:italic;">Peso Total:</span> ${escapeHtml(getTotalWeight())}</div>
        <div><span style="font-weight:700; font-style:italic;">Transportadora (cod. SAP):</span> ${escapeHtml(summaryFields.transportadora.value || "-")}</div>
      </div>
      ${productBlocks}
    </div>
  `;
}

function findProductBySapCode(code) {
  return productCatalog[String(code || "").trim()];
}

function setProductStatus(statusElement, text, mode = "") {
  statusElement.textContent = text;
  statusElement.classList.remove("is-found", "is-missing");

  if (mode) {
    statusElement.classList.add(mode);
  }
}

function syncProductFromCatalog(card) {
  const codigoSapInput = card.querySelector('[data-field="codigoSap"]');
  const descricaoInput = card.querySelector('[data-field="descricaoProduto"]');
  const valorInput = card.querySelector('[data-field="valorUnitario"]');
  const status = card.querySelector('[data-role="product-status"]');
  const catalogProduct = findProductBySapCode(codigoSapInput.value);

  if (catalogProduct) {
    descricaoInput.value = catalogProduct.descricaoProduto;
    valorInput.value = formatCurrency(catalogProduct.valorUnitario);
    setProductStatus(
      status,
      "Produto encontrado. Voce pode ajustar apenas quantidade, patrimonio e peso.",
      "is-found",
    );
    return;
  }

  descricaoInput.value = "";
  valorInput.value = "";

  if (codigoSapInput.value.trim()) {
    setProductStatus(
      status,
      "Codigo SAP nao encontrado. Use o botao 'Cadastrar novo produto SAP' para incluir esse item.",
      "is-missing",
    );
  } else {
    setProductStatus(
      status,
      "Digite o codigo SAP para preencher descricao e valor automaticamente.",
    );
  }
}

function renderPreview() {
  const products = getProducts();
  summaryFields.pesoTotalGeral.value = getTotalWeight();

  if (products.length === 0) {
    preview.innerHTML = `
      ${buildSummaryTable()}
      <div class="empty-state">
        Nenhum produto cadastrado. Adicione ao menos um item para montar a solicitacao.
      </div>
    `;
    return;
  }

  preview.innerHTML = `
    <div class="email-copy">
      ${buildEmailIntroHtml()}
      ${buildSummaryTable()}
    </div>
    ${products.map((product, index) => buildProductTable(product, index)).join("")}
  `;
}

function attachProductEvents(card) {
  const inputs = card.querySelectorAll("[data-field]");
  const removeButton = card.querySelector(".remove-product");
  const codigoSapInput = card.querySelector('[data-field="codigoSap"]');
  const weightInput = card.querySelector('[data-field="pesoTotal"]');

  inputs.forEach((input) => {
    if (input === codigoSapInput) {
      return;
    }

    input.addEventListener("input", renderPreview);
  });

  codigoSapInput.addEventListener("input", () => {
    syncProductFromCatalog(card);
    renderPreview();
  });

  weightInput.addEventListener("input", () => {
    updateWeightStatus(card);
    renderPreview();
  });

  weightInput.addEventListener("blur", () => {
    weightInput.value = normalizeWeightInputValue(weightInput.value);
    updateWeightStatus(card);
    renderPreview();
  });

  removeButton.addEventListener("click", () => {
    if (productsList.querySelectorAll(".product-card").length <= 1) {
      return;
    }

    card.remove();
    updateProductTitles();
    renderPreview();
  });
}

function updateProductTitles() {
  Array.from(productsList.querySelectorAll(".product-card")).forEach((card, index) => {
    const title = card.querySelector(".product-title");
    const removeButton = card.querySelector(".remove-product");
    title.textContent = `Produto ${index + 1}`;
    removeButton.classList.toggle("is-hidden", index === 0);
  });
}

function addProduct(product = {}) {
  const fragment = productTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".product-card");

  card.querySelectorAll("[data-field]").forEach((input) => {
    const fieldName = input.dataset.field;
    input.value = product[fieldName] ?? input.value;
  });

  productsList.appendChild(card);

  const lastCard = productsList.lastElementChild;
  syncProductFromCatalog(lastCard);
  updateWeightStatus(lastCard);
  attachProductEvents(lastCard);
  updateProductTitles();
  renderPreview();
}

function setModalFeedback(message, type = "") {
  modalFeedback.textContent = message;
  modalFeedback.classList.remove("is-success", "is-error");

  if (type) {
    modalFeedback.classList.add(type);
  }
}

function setSapModalFeedback(message, type = "") {
  sapModalFeedback.textContent = message;
  sapModalFeedback.classList.remove("is-success", "is-error");

  if (type) {
    sapModalFeedback.classList.add(type);
  }
}

function setTransportadoraModalFeedback(message, type = "") {
  transportadoraModalFeedback.textContent = message;
  transportadoraModalFeedback.classList.remove("is-success", "is-error");

  if (type) {
    transportadoraModalFeedback.classList.add(type);
  }
}

function openSapModal() {
  sapForm.reset();
  editingSapCode = null;
  setSapModalFeedback("Cadastre um novo codigo SAP para alimentar Origem e Destino.");
  renderSapRegisteredList();
  sapModal.showModal();
  document.getElementById("modal-sap-codigo").focus();
}

function closeSapModal() {
  sapModal.close();
}

function openTransportadoraModal() {
  transportadoraForm.reset();
  editingTransportadoraCode = null;
  setTransportadoraModalFeedback("Cadastre uma nova transportadora ou ajuste uma existente.");
  renderTransportadoraRegisteredList();
  transportadoraModal.showModal();
  document.getElementById("modal-transportadora-codigo").focus();
}

function closeTransportadoraModal() {
  transportadoraModal.close();
}

function renderSapRegisteredList() {
  const registeredItems = locationCatalog.origem.map((item) => {
    const isCustom = customSapReferences.sapReferences.some((entry) => entry.codigo === item.codigo);
    return {
      ...item,
      source: isCustom ? "Manual" : "Padrao",
    };
  });

  if (!registeredItems.length) {
    sapRegisteredList.innerHTML = `
      <div class="empty-state">
        Nenhum codigo SAP cadastrado manualmente ate o momento.
      </div>
    `;
    return;
  }

  sapRegisteredList.innerHTML = registeredItems
    .map((item) => {
      if (editingSapCode === item.codigo) {
        return `
          <article class="sap-registered-item is-editing" data-code="${escapeHtml(item.codigo)}">
            <div class="sap-inline-form">
              <div class="sap-inline-grid">
                <label>
                  <span>Codigo SAP</span>
                  <input type="text" data-inline-field="codigo" value="${escapeHtml(item.codigo)}">
                </label>
                <label>
                  <span>Descricao</span>
                  <input type="text" data-inline-field="descricao" value="${escapeHtml(item.descricao)}">
                </label>
              </div>
              <div class="sap-registered-actions">
                <button class="ghost-button mini-button" type="button" data-action="cancel-edit-sap" data-code="${escapeHtml(item.codigo)}">Cancelar</button>
                <button class="primary-button mini-button" type="button" data-action="save-inline-sap" data-code="${escapeHtml(item.codigo)}">Salvar</button>
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article class="sap-registered-item">
          <div>
            <div class="sap-registered-code">${escapeHtml(item.codigo)}</div>
            <div class="sap-registered-description">${escapeHtml(item.descricao)}</div>
            <div class="sap-registered-description">Base: ${escapeHtml(item.source)}</div>
          </div>
          <div class="sap-registered-actions">
            <button class="ghost-button mini-button" type="button" data-action="edit-sap" data-code="${escapeHtml(item.codigo)}">Editar</button>
            <button class="danger-button mini-button" type="button" data-action="delete-sap" data-code="${escapeHtml(item.codigo)}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function refreshSapReferences() {
  persistCustomSapReferences();
  locationCatalog = mergeLocationCatalogs(baseLocationCatalog, customSapReferences, customTransportadoras);
  populateReferenceList("origem", locationCatalog.origem);
  populateReferenceList("destino", locationCatalog.destino);
  renderSapRegisteredList();
}

function renderTransportadoraRegisteredList() {
  const registeredItems = locationCatalog.transportadora.map((item) => {
    const isCustom = customTransportadoras.transportadoras.some((entry) => entry.codigo === item.codigo);
    return {
      ...item,
      source: isCustom ? "Manual" : "Padrao",
    };
  });

  if (!registeredItems.length) {
    transportadoraRegisteredList.innerHTML = `
      <div class="empty-state">
        Nenhuma transportadora cadastrada ate o momento.
      </div>
    `;
    return;
  }

  transportadoraRegisteredList.innerHTML = registeredItems
    .map((item) => {
      if (editingTransportadoraCode === item.codigo) {
        return `
          <article class="sap-registered-item is-editing" data-code="${escapeHtml(item.codigo)}">
            <div class="sap-inline-form">
              <div class="sap-inline-grid">
                <label>
                  <span>Codigo SAP</span>
                  <input type="text" data-inline-field="codigo" value="${escapeHtml(item.codigo)}">
                </label>
                <label>
                  <span>Descricao</span>
                  <input type="text" data-inline-field="descricao" value="${escapeHtml(item.descricao)}">
                </label>
              </div>
              <div class="sap-registered-actions">
                <button class="ghost-button mini-button" type="button" data-action="cancel-edit-transportadora" data-code="${escapeHtml(item.codigo)}">Cancelar</button>
                <button class="primary-button mini-button" type="button" data-action="save-inline-transportadora" data-code="${escapeHtml(item.codigo)}">Salvar</button>
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article class="sap-registered-item">
          <div>
            <div class="sap-registered-code">${escapeHtml(item.codigo)}</div>
            <div class="sap-registered-description">${escapeHtml(item.descricao)}</div>
            <div class="sap-registered-description">Base: ${escapeHtml(item.source)}</div>
          </div>
          <div class="sap-registered-actions">
            <button class="ghost-button mini-button" type="button" data-action="edit-transportadora" data-code="${escapeHtml(item.codigo)}">Editar</button>
            <button class="danger-button mini-button" type="button" data-action="delete-transportadora" data-code="${escapeHtml(item.codigo)}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function refreshTransportadoras() {
  persistCustomTransportadoras();
  locationCatalog = mergeLocationCatalogs(baseLocationCatalog, customSapReferences, customTransportadoras);
  populateReferenceList("transportadora", locationCatalog.transportadora);
  renderTransportadoraRegisteredList();
}

function startEditingSap(code) {
  const item = locationCatalog.origem.find((entry) => entry.codigo === code);

  if (!item) {
    return;
  }

  editingSapCode = code;
  renderSapRegisteredList();
  setSapModalFeedback("Edite o endereco diretamente na linha e clique em salvar.", "is-success");
}

function deleteSapReference(code) {
  const isBaseItem = baseLocationCatalog.sapReferences.some((item) => item.codigo === code);

  customSapReferences.sapReferences = customSapReferences.sapReferences.filter((item) => item.codigo !== code);

  if (isBaseItem) {
    customSapReferences.removedCodes = Array.from(new Set([...customSapReferences.removedCodes, code]));
  } else {
    customSapReferences.removedCodes = customSapReferences.removedCodes.filter((item) => item !== code);
  }

  refreshSapReferences();
  setSapModalFeedback("Codigo removido com sucesso.", "is-success");
}

function startEditingTransportadora(code) {
  const item = locationCatalog.transportadora.find((entry) => entry.codigo === code);

  if (!item) {
    return;
  }

  editingTransportadoraCode = code;
  renderTransportadoraRegisteredList();
  setTransportadoraModalFeedback("Edite a transportadora diretamente na linha e clique em salvar.", "is-success");
}

function deleteTransportadora(code) {
  const isBaseItem = baseLocationCatalog.transportadora.some((item) => item.codigo === code);

  customTransportadoras.transportadoras = customTransportadoras.transportadoras.filter((item) => item.codigo !== code);

  if (isBaseItem) {
    customTransportadoras.removedCodes = Array.from(new Set([...customTransportadoras.removedCodes, code]));
  } else {
    customTransportadoras.removedCodes = customTransportadoras.removedCodes.filter((item) => item !== code);
  }

  refreshTransportadoras();
  setTransportadoraModalFeedback("Transportadora removida com sucesso.", "is-success");
}

function handleSapListClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, code } = button.dataset;

  if (action === "edit-sap") {
    startEditingSap(code);
    return;
  }

  if (action === "cancel-edit-sap") {
    editingSapCode = null;
    renderSapRegisteredList();
    setSapModalFeedback("Edicao cancelada.", "is-success");
    return;
  }

  if (action === "save-inline-sap") {
    saveInlineSap(code, button.closest(".sap-registered-item"));
    return;
  }

  if (action === "delete-sap") {
    deleteSapReference(code);
  }
}

function handleTransportadoraListClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, code } = button.dataset;

  if (action === "edit-transportadora") {
    startEditingTransportadora(code);
    return;
  }

  if (action === "cancel-edit-transportadora") {
    editingTransportadoraCode = null;
    renderTransportadoraRegisteredList();
    setTransportadoraModalFeedback("Edicao cancelada.", "is-success");
    return;
  }

  if (action === "save-inline-transportadora") {
    saveInlineTransportadora(code, button.closest(".sap-registered-item"));
    return;
  }

  if (action === "delete-transportadora") {
    deleteTransportadora(code);
  }
}

function saveInlineSap(originalCode, container) {
  const codigo = String(container.querySelector('[data-inline-field="codigo"]').value || "").trim().toUpperCase();
  const descricao = String(container.querySelector('[data-inline-field="descricao"]').value || "").trim().toUpperCase();

  if (!codigo || !descricao) {
    setSapModalFeedback("Preencha codigo SAP e descricao.", "is-error");
    return;
  }

  const alreadyExists = locationCatalog.origem.some(
    (item) => item.codigo === codigo && item.codigo !== originalCode,
  );

  if (alreadyExists) {
    setSapModalFeedback("Esse codigo SAP ja existe nas listas de Origem/Destino.", "is-error");
    return;
  }

  customSapReferences.removedCodes = customSapReferences.removedCodes.filter((item) => item !== codigo);

  const editingBaseItem = baseLocationCatalog.sapReferences.some((item) => item.codigo === originalCode);
  const existingCustomIndex = customSapReferences.sapReferences.findIndex((item) => item.codigo === originalCode);

  if (existingCustomIndex >= 0) {
    customSapReferences.sapReferences[existingCustomIndex] = { codigo, descricao };
  } else {
    customSapReferences.sapReferences.push({ codigo, descricao });
  }

  if (originalCode !== codigo) {
    customSapReferences.sapReferences = customSapReferences.sapReferences.filter((item) => (
      item.codigo !== originalCode || item.codigo === codigo
    ));

    if (editingBaseItem) {
      customSapReferences.removedCodes = Array.from(
        new Set([...customSapReferences.removedCodes, originalCode]),
      );
    }
  }

  customSapReferences.sapReferences = dedupeSapReferences(customSapReferences.sapReferences);
  editingSapCode = null;
  refreshSapReferences();
  setSapModalFeedback("Endereco salvo com sucesso.", "is-success");
}

function saveInlineTransportadora(originalCode, container) {
  const codigo = String(container.querySelector('[data-inline-field="codigo"]').value || "").trim();
  const descricao = String(container.querySelector('[data-inline-field="descricao"]').value || "").trim().toUpperCase();

  if (!codigo || !descricao) {
    setTransportadoraModalFeedback("Preencha codigo SAP e descricao.", "is-error");
    return;
  }

  const alreadyExists = locationCatalog.transportadora.some(
    (item) => item.codigo === codigo && item.codigo !== originalCode,
  );

  if (alreadyExists) {
    setTransportadoraModalFeedback("Esse codigo SAP ja existe na lista de transportadoras.", "is-error");
    return;
  }

  customTransportadoras.removedCodes = customTransportadoras.removedCodes.filter((item) => item !== codigo);

  const editingBaseItem = baseLocationCatalog.transportadora.some((item) => item.codigo === originalCode);
  const existingCustomIndex = customTransportadoras.transportadoras.findIndex((item) => item.codigo === originalCode);

  if (existingCustomIndex >= 0) {
    customTransportadoras.transportadoras[existingCustomIndex] = { codigo, descricao };
  } else {
    customTransportadoras.transportadoras.push({ codigo, descricao });
  }

  if (originalCode !== codigo) {
    customTransportadoras.transportadoras = customTransportadoras.transportadoras.filter((item) => (
      item.codigo !== originalCode || item.codigo === codigo
    ));

    if (editingBaseItem) {
      customTransportadoras.removedCodes = Array.from(
        new Set([...customTransportadoras.removedCodes, originalCode]),
      );
    }
  }

  customTransportadoras.transportadoras = dedupeSapReferences(customTransportadoras.transportadoras);
  editingTransportadoraCode = null;
  refreshTransportadoras();
  setTransportadoraModalFeedback("Transportadora salva com sucesso.", "is-success");
}

function saveSapReference(event) {
  event.preventDefault();

  const formData = new FormData(sapForm);
  const codigo = String(formData.get("codigo") || "").trim().toUpperCase();
  const descricao = String(formData.get("descricao") || "").trim().toUpperCase();

  if (!codigo || !descricao) {
    setSapModalFeedback("Preencha codigo SAP e descricao.", "is-error");
    return;
  }

  const alreadyExists = locationCatalog.origem.some(
    (item) => item.codigo === codigo && item.codigo !== editingSapCode,
  );

  if (alreadyExists) {
    setSapModalFeedback("Esse codigo SAP ja existe nas listas de Origem/Destino.", "is-error");
    return;
  }

  customSapReferences.removedCodes = customSapReferences.removedCodes.filter((item) => item !== codigo);

  if (editingSapCode) {
    const editingBaseItem = baseLocationCatalog.sapReferences.some((item) => item.codigo === editingSapCode);
    const existingCustomIndex = customSapReferences.sapReferences.findIndex((item) => item.codigo === editingSapCode);

    if (existingCustomIndex >= 0) {
      customSapReferences.sapReferences[existingCustomIndex] = { codigo, descricao };
    } else {
      customSapReferences.sapReferences.push({ codigo, descricao });
    }

    if (editingSapCode !== codigo) {
      customSapReferences.sapReferences = customSapReferences.sapReferences.filter((item) => (
        item.codigo !== editingSapCode || item.codigo === codigo
      ));

      if (editingBaseItem) {
        customSapReferences.removedCodes = Array.from(
          new Set([...customSapReferences.removedCodes, editingSapCode]),
        );
      }
    }
  } else {
    customSapReferences.sapReferences.push({ codigo, descricao });
  }

  customSapReferences.sapReferences = dedupeSapReferences(customSapReferences.sapReferences);
  refreshSapReferences();
  editingSapCode = null;
  sapForm.reset();
  setSapModalFeedback("Codigo salvo com sucesso. Ele ja esta disponivel em Origem e Destino.", "is-success");

  document.getElementById("modal-sap-codigo").focus();
}

function saveTransportadora(event) {
  event.preventDefault();

  const formData = new FormData(transportadoraForm);
  const codigo = String(formData.get("codigo") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim().toUpperCase();

  if (!codigo || !descricao) {
    setTransportadoraModalFeedback("Preencha codigo SAP e descricao.", "is-error");
    return;
  }

  const alreadyExists = locationCatalog.transportadora.some(
    (item) => item.codigo === codigo && item.codigo !== editingTransportadoraCode,
  );

  if (alreadyExists) {
    setTransportadoraModalFeedback("Esse codigo SAP ja existe na lista de transportadoras.", "is-error");
    return;
  }

  customTransportadoras.removedCodes = customTransportadoras.removedCodes.filter((item) => item !== codigo);

  if (editingTransportadoraCode) {
    const editingBaseItem = baseLocationCatalog.transportadora.some((item) => item.codigo === editingTransportadoraCode);
    const existingCustomIndex = customTransportadoras.transportadoras.findIndex((item) => item.codigo === editingTransportadoraCode);

    if (existingCustomIndex >= 0) {
      customTransportadoras.transportadoras[existingCustomIndex] = { codigo, descricao };
    } else {
      customTransportadoras.transportadoras.push({ codigo, descricao });
    }

    if (editingTransportadoraCode !== codigo) {
      customTransportadoras.transportadoras = customTransportadoras.transportadoras.filter((item) => (
        item.codigo !== editingTransportadoraCode || item.codigo === codigo
      ));

      if (editingBaseItem) {
        customTransportadoras.removedCodes = Array.from(
          new Set([...customTransportadoras.removedCodes, editingTransportadoraCode]),
        );
      }
    }
  } else {
    customTransportadoras.transportadoras.push({ codigo, descricao });
  }

  customTransportadoras.transportadoras = dedupeSapReferences(customTransportadoras.transportadoras);
  refreshTransportadoras();
  editingTransportadoraCode = null;
  transportadoraForm.reset();
  setTransportadoraModalFeedback("Transportadora salva com sucesso.", "is-success");

  document.getElementById("modal-transportadora-codigo").focus();
}

function openProductModal() {
  productForm.reset();
  editingProductCode = null;
  document.getElementById("modal-product-original-code").value = "";
  modalValorUnitarioInput.value = "";
  setModalFeedback("Cadastre, edite ou exclua produtos do catalogo.");
  renderProductRegisteredList();
  productModal.showModal();
  document.getElementById("modal-codigo-sap").focus();
}

function closeProductModal() {
  productModal.close();
}

function renderProductRegisteredList() {
  const registeredItems = Object.entries(productCatalog)
    .sort(([codeA], [codeB]) => codeA.localeCompare(codeB))
    .map(([codigoSap, product]) => {
      const isCustom = Boolean(customProductCatalog.products?.[codigoSap]);
      return {
        codigoSap,
        ...product,
        source: isCustom ? "Manual" : "Padrao",
      };
    });

  if (!registeredItems.length) {
    productRegisteredList.innerHTML = `
      <div class="empty-state">
        Nenhum produto cadastrado no catalogo.
      </div>
    `;
    return;
  }

  productRegisteredList.innerHTML = registeredItems
    .map((item) => {
      if (editingProductCode === item.codigoSap) {
        return `
          <article class="sap-registered-item is-editing" data-code="${escapeHtml(item.codigoSap)}">
            <div class="sap-inline-form">
              <div class="sap-inline-grid">
                <label>
                  <span>Codigo SAP</span>
                  <input type="text" data-inline-field="codigoSap" value="${escapeHtml(item.codigoSap)}">
                </label>
                <label>
                  <span>Valor unitario (R$)</span>
                  <input type="text" inputmode="decimal" data-inline-field="valorUnitario" value="${escapeHtml(formatCurrency(item.valorUnitario).replace("R$", "").trim())}">
                </label>
              </div>
              <label>
                <span>Descricao do produto</span>
                <input type="text" data-inline-field="descricaoProduto" value="${escapeHtml(item.descricaoProduto)}">
              </label>
              <div class="sap-registered-actions">
                <button class="ghost-button mini-button" type="button" data-action="cancel-edit-product" data-code="${escapeHtml(item.codigoSap)}">Cancelar</button>
                <button class="primary-button mini-button" type="button" data-action="save-inline-product" data-code="${escapeHtml(item.codigoSap)}">Salvar</button>
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article class="sap-registered-item">
          <div>
            <div class="sap-registered-code">${escapeHtml(item.codigoSap)}</div>
            <div class="sap-registered-description">${escapeHtml(item.descricaoProduto)}</div>
            <div class="sap-registered-description">Valor: ${escapeHtml(formatCurrency(item.valorUnitario))}</div>
            <div class="sap-registered-description">Base: ${escapeHtml(item.source)}</div>
          </div>
          <div class="sap-registered-actions">
            <button class="ghost-button mini-button" type="button" data-action="edit-product" data-code="${escapeHtml(item.codigoSap)}">Editar</button>
            <button class="danger-button mini-button" type="button" data-action="delete-product" data-code="${escapeHtml(item.codigoSap)}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function refreshProductCatalog() {
  persistCustomProducts();
  productCatalog = mergeProductCatalogs(baseProductCatalog, customProductCatalog);
  populateProductReferenceList();
  renderProductRegisteredList();
  productsList.querySelectorAll(".product-card").forEach((card) => {
    syncProductFromCatalog(card);
  });
  renderPreview();
}

function startEditingProduct(code) {
  const product = productCatalog[code];

  if (!product) {
    return;
  }

  editingProductCode = code;
  renderProductRegisteredList();
  setModalFeedback("Edite o produto diretamente na linha e clique em salvar.", "is-success");
}

function deleteProductFromCatalog(code) {
  const isBaseItem = Boolean(baseProductCatalog[code]);

  if (customProductCatalog.products?.[code]) {
    delete customProductCatalog.products[code];
  }

  if (isBaseItem) {
    customProductCatalog.removedCodes = Array.from(new Set([...(customProductCatalog.removedCodes || []), code]));
  } else {
    customProductCatalog.removedCodes = (customProductCatalog.removedCodes || []).filter((item) => item !== code);
  }

  refreshProductCatalog();
  setModalFeedback("Produto removido com sucesso.", "is-success");
}

function handleProductListClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, code } = button.dataset;

  if (action === "edit-product") {
    startEditingProduct(code);
    return;
  }

  if (action === "cancel-edit-product") {
    editingProductCode = null;
    renderProductRegisteredList();
    setModalFeedback("Edicao cancelada.", "is-success");
    return;
  }

  if (action === "save-inline-product") {
    saveInlineProduct(code, button.closest(".sap-registered-item"));
    return;
  }

  if (action === "delete-product") {
    deleteProductFromCatalog(code);
  }
}

function saveInlineProduct(originalCode, container) {
  const codigoSap = String(container.querySelector('[data-inline-field="codigoSap"]').value || "").trim();
  const descricaoProduto = String(container.querySelector('[data-inline-field="descricaoProduto"]').value || "").trim();
  const valorUnitario = normalizeCurrencyValue(container.querySelector('[data-inline-field="valorUnitario"]').value);

  if (!codigoSap || !descricaoProduto || Number(valorUnitario) <= 0) {
    setModalFeedback("Preencha codigo SAP, descricao e valor unitario.", "is-error");
    return;
  }

  const alreadyExists = Object.keys(productCatalog).some(
    (code) => code === codigoSap && code !== originalCode,
  );

  if (alreadyExists) {
    setModalFeedback("Esse codigo SAP ja existe no catalogo de produtos.", "is-error");
    return;
  }

  customProductCatalog.removedCodes = (customProductCatalog.removedCodes || []).filter((item) => item !== codigoSap);

  if (originalCode && originalCode !== codigoSap && baseProductCatalog[originalCode]) {
    customProductCatalog.removedCodes = Array.from(
      new Set([...(customProductCatalog.removedCodes || []), originalCode]),
    );
  }

  if (!customProductCatalog.products) {
    customProductCatalog.products = {};
  }

  if (originalCode && originalCode !== codigoSap) {
    delete customProductCatalog.products[originalCode];
  }

  customProductCatalog.products[codigoSap] = {
    descricaoProduto,
    valorUnitario,
  };

  editingProductCode = null;
  refreshProductCatalog();
  setModalFeedback("Produto salvo com sucesso.", "is-success");
}

function saveProductFromModal(event) {
  event.preventDefault();

  const formData = new FormData(productForm);
  const originalCodigoSap = String(formData.get("originalCodigoSap") || "").trim();
  const codigoSap = String(formData.get("codigoSap") || "").trim();
  const descricaoProduto = String(formData.get("descricaoProduto") || "").trim();
  const valorUnitario = normalizeCurrencyValue(formData.get("valorUnitario"));

  if (!codigoSap || !descricaoProduto || Number(valorUnitario) <= 0) {
    setModalFeedback("Preencha codigo SAP, descricao e valor unitario.", "is-error");
    return;
  }

  const alreadyExists = Object.keys(productCatalog).some(
    (code) => code === codigoSap && code !== originalCodigoSap,
  );

  if (alreadyExists) {
    setModalFeedback("Esse codigo SAP ja existe no catalogo de produtos.", "is-error");
    return;
  }

  customProductCatalog.removedCodes = (customProductCatalog.removedCodes || []).filter((item) => item !== codigoSap);

  if (originalCodigoSap && originalCodigoSap !== codigoSap && baseProductCatalog[originalCodigoSap]) {
    customProductCatalog.removedCodes = Array.from(
      new Set([...(customProductCatalog.removedCodes || []), originalCodigoSap]),
    );
  }

  if (!customProductCatalog.products) {
    customProductCatalog.products = {};
  }

  if (originalCodigoSap && originalCodigoSap !== codigoSap) {
    delete customProductCatalog.products[originalCodigoSap];
  }

  customProductCatalog.products[codigoSap] = {
    descricaoProduto,
    valorUnitario,
  };

  refreshProductCatalog();
  editingProductCode = null;
  productForm.reset();
  document.getElementById("modal-product-original-code").value = "";
  setModalFeedback("Produto salvo com sucesso. Ele ja pode ser usado nos cards da solicitacao.", "is-success");
  document.getElementById("modal-codigo-sap").focus();
}

function buildEmailBody() {
  const products = getProducts();
  const lines = [
    buildEmailIntroText(),
    `Origem (cod. SAP): ${summaryFields.origem.value}`,
    `Destino (cod. SAP): ${summaryFields.destino.value}`,
    `Total de Volumes: ${summaryFields.volumes.value}`,
    `Peso Total: ${getTotalWeight()}`,
    `Transportadora (cod. SAP): ${summaryFields.transportadora.value}`,
    "",
  ];

  products.forEach((product, index) => {
    const patrimonio = product.codigoPatrimonio?.trim() ? product.codigoPatrimonio : "--------";
    lines.push(`Produto ${index + 1}`);
    lines.push(`Produto (cod. SAP): ${product.codigoSap || "-"}`);
    lines.push(`Descricao Produto: ${product.descricaoProduto || "-"}`);
    lines.push(`Quantidade: ${formatQuantity(product.quantidade)}`);
    lines.push(`Valor Unitario (R$): ${formatCurrency(product.valorUnitario).replace("R$", "").trim()}`);
    lines.push(`Peso: ${product.pesoTotal || "-"}`);
    lines.push(`Codigo Patrimonio: ${patrimonio}`);
    lines.push("");
  });

  lines.push("Observacao: o corpo formatado em tabela foi copiado da pagina para voce colar no email.");

  return lines.join("\n");
}

function parseRecipients(value) {
  return String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function sendEmailRequest() {
  const recipients = parseRecipients(summaryFields.emailDestinatario.value);
  const subject = summaryFields.assuntoEmail.value.trim();

  if (recipients.length === 0) {
    window.alert("Preencha ao menos um email corporativo de destino antes de enviar.");
    summaryFields.emailDestinatario.focus();
    return;
  }

  if (!subject) {
    window.alert("Preencha o assunto do email antes de enviar.");
    summaryFields.assuntoEmail.focus();
    return;
  }

  const body = buildEmailBody();
  const mailtoUrl = `mailto:${encodeURIComponent(recipients.join(";"))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
}


function extrairCidade(valor) {
  const texto = String(valor || '').trim();
  if (!texto) return '';
  // Pega tudo depois do ' - ' (ex: 'BR01 - MATRIZ' -> 'MATRIZ')
  const partes = texto.split(' - ');
  if (partes.length >= 2) {
    // Capitaliza primeira letra de cada palavra
    return partes.slice(1).join(' - ')
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, l => l.toUpperCase());
  }
  return texto;
}

function atualizarAssuntoEmail() {
  const origem = extrairCidade(summaryFields.origem.value);
  const destino = extrairCidade(summaryFields.destino.value);
  if (origem || destino) {
    const de = origem || '?';
    const para = destino || '?';
    summaryFields.assuntoEmail.value = 'Solicitacao: Emissao de NF - ' + de + ' > ' + para;
  }
}

Object.values(summaryFields).forEach((input) => {
  input.addEventListener("input", renderPreview);
});

summaryFields.origem.addEventListener("input", atualizarAssuntoEmail);
summaryFields.destino.addEventListener("input", atualizarAssuntoEmail);

addProductButton.addEventListener("click", () => addProduct());
sendEmailButton.addEventListener("click", sendEmailRequest);
openSapModalButton.addEventListener("click", openSapModal);
closeSapModalButton.addEventListener("click", closeSapModal);
cancelSapModalButton.addEventListener("click", closeSapModal);
sapForm.addEventListener("submit", saveSapReference);
sapRegisteredList.addEventListener("click", handleSapListClick);
openTransportadoraModalButton.addEventListener("click", openTransportadoraModal);
closeTransportadoraModalButton.addEventListener("click", closeTransportadoraModal);
cancelTransportadoraModalButton.addEventListener("click", closeTransportadoraModal);
transportadoraForm.addEventListener("submit", saveTransportadora);
transportadoraRegisteredList.addEventListener("click", handleTransportadoraListClick);
openProductModalButton.addEventListener("click", openProductModal);
closeProductModalButton.addEventListener("click", closeProductModal);
cancelProductModalButton.addEventListener("click", closeProductModal);
productForm.addEventListener("submit", saveProductFromModal);
productRegisteredList.addEventListener("click", handleProductListClick);
modalValorUnitarioInput.addEventListener("input", (event) => {
  event.target.value = formatCurrencyInput(event.target.value);
});
productRegisteredList.addEventListener("input", (event) => {
  if (event.target.matches('[data-inline-field="valorUnitario"]')) {
    event.target.value = formatCurrencyInput(event.target.value);
  }
});

initializeReferenceLists();
initialProducts.forEach((product) => addProduct(product));
renderPreview();
