/* ═══════════════════════════════════════
   app.js
═══════════════════════════════════════ */

const membersGrid = document.getElementById("members-grid");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const tableFoot = document.getElementById("table-foot");

const btnAddRow = document.getElementById("btn-add-row");
const btnDelRow = document.getElementById("btn-del-row");
const btnCalc = document.getElementById("btn-calc");
const btnDraw = document.getElementById("btn-draw");

const btnSave = document.getElementById("btn-save");
const btnPrint = document.getElementById("btn-print");
const btnReset = document.getElementById("btn-reset");

const btnAddCtrl = document.getElementById("btn-add-ctrl");
const ctrlList = document.getElementById("ctrl-list");

const unitP = document.getElementById("unit-P");
const unitV = document.getElementById("unit-V");

const pvAvg = document.getElementById("pv-avg");
const pvUnitDisplay = document.getElementById("pv-unit-display");

let chart = null;

/* ═══════════════════════════════════════
   MEMBER GENERATOR
═══════════════════════════════════════ */

function generateMembers() {
  membersGrid.innerHTML = "";

  for (let i = 1; i <= DEFAULT_MEMBERS; i++) {
    const row = document.createElement("div");
    row.className = "member-row";

    row.innerHTML = `
      <div class="member-num">${i}</div>

      <input 
        type="text"
        class="member-input"
        placeholder="ชื่อ - นามสกุล"
      />

      <div class="member-sub">
        <span>เลขที่</span>
        <input type="text" />
      </div>
    `;

    membersGrid.appendChild(row);
  }
}

/* ═══════════════════════════════════════
   TABLE
═══════════════════════════════════════ */

function buildTableHead() {
  tableHead.innerHTML = `
    <tr>
      <th class="col-trial">ครั้งที่</th>
      <th class="col-P">
        P (${unitP.value})
      </th>
      <th class="col-V">
        V (${unitV.value})
      </th>
      <th class="col-PV">
        P × V
      </th>
      <th class="col-note">
        หมายเหตุ
      </th>
    </tr>
  `;
}

function addRow(p = "", v = "", note = "") {

  const rowCount = tableBody.children.length + 1;

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="trial-num">${rowCount}</td>

    <td>
      <input type="number" class="input-p" value="${p}" step="any">
    </td>

    <td>
      <input type="number" class="input-v" value="${v}" step="any">
    </td>

    <td class="pv-cell">—</td>

    <td class="note-cell">
      <input type="text" value="${note}">
    </td>
  `;

  tableBody.appendChild(tr);
}

function removeRow() {
  if (tableBody.children.length > 1) {
    tableBody.removeChild(tableBody.lastElementChild);
  }
}

function buildFoot() {

  tableFoot.innerHTML = `
    <tr>
      <td colspan="3" class="foot-label">
        ค่าเฉลี่ย P × V
      </td>

      <td id="foot-avg">—</td>

      <td>คงที่โดยประมาณ</td>
    </tr>
  `;
}

/* ═══════════════════════════════════════
   CALCULATE
═══════════════════════════════════════ */

function calculatePV() {

  const rows = tableBody.querySelectorAll("tr");

  let total = 0;
  let count = 0;

  rows.forEach(row => {

    const p = parseFloat(
      row.querySelector(".input-p").value
    );

    const v = parseFloat(
      row.querySelector(".input-v").value
    );

    const pvCell = row.querySelector(".pv-cell");

    if (!isNaN(p) && !isNaN(v)) {

      const pv = p * v;

      pvCell.textContent = pv.toFixed(2);

      total += pv;
      count++;

    } else {

      pvCell.textContent = "—";
    }
  });

  let avg = 0;

  if (count > 0) {
    avg = total / count;
  }

  const avgText = avg
    ? avg.toFixed(2)
    : "—";

  document.getElementById("foot-avg").textContent =
    avgText;

  pvAvg.textContent = avgText;

  pvUnitDisplay.textContent =
    `${unitP.value}·${unitV.value}`;
}

/* ═══════════════════════════════════════
   CHART
═══════════════════════════════════════ */

function drawChart() {

  const rows = tableBody.querySelectorAll("tr");

  const points = [];
  const pvData = [];

  rows.forEach((row, index) => {

    const p = parseFloat(
      row.querySelector(".input-p").value
    );

    const v = parseFloat(
      row.querySelector(".input-v").value
    );

    if (!isNaN(p) && !isNaN(v)) {

      points.push({
        x: p,
        y: v
      });

      pvData.push(p * v);
    }
  });

  const ctx =
    document.getElementById("main-chart");

  if (chart) {
    chart.destroy();
  }

  const type =
    document.getElementById("chart-type").value;

  if (type === "pv-product") {

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: pvData.map((_, i) => `ครั้งที่ ${i + 1}`),
        datasets: [{
          label: "P × V",
          data: pvData,
          tension: 0.3
        }]
      },

      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff"
            }
          }
        },

        scales: {
          x: {
            ticks: {
              color: "#fff"
            }
          },

          y: {
            ticks: {
              color: "#fff"
            }
          }
        }
      }
    });

  } else {

    chart = new Chart(ctx, {
      type: type,

      data: {
        datasets: [{
          label: "P vs V",
          data: points,
          tension: 0.3
        }]
      },

      options: {
        responsive: true,

        plugins: {
          legend: {
            labels: {
              color: "#fff"
            }
          }
        },

        scales: {

          x: {
            title: {
              display: true,
              text: `P (${unitP.value})`,
              color: "#fff"
            },

            ticks: {
              color: "#fff"
            }
          },

          y: {
            title: {
              display: true,
              text: `V (${unitV.value})`,
              color: "#fff"
            },

            ticks: {
              color: "#fff"
            }
          }
        }
      }
    });
  }
}

/* ═══════════════════════════════════════
   SAVE JSON
═══════════════════════════════════════ */

function saveJSON() {

  const rows = [];

  tableBody.querySelectorAll("tr")
    .forEach(row => {

      rows.push({
        pressure:
          row.querySelector(".input-p").value,

        volume:
          row.querySelector(".input-v").value,

        pv:
          row.querySelector(".pv-cell").textContent
      });
    });

  const data = {
    question:
      document.getElementById("question").value,

    hypothesis:
      document.getElementById("hypothesis").value,

    data: rows
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = "experiment-data.json";

  a.click();
}

/* ═══════════════════════════════════════
   RESET
═══════════════════════════════════════ */

function resetAll() {

  if (
    !confirm("ล้างข้อมูลทั้งหมด ?")
  ) return;

  location.reload();
}

/* ═══════════════════════════════════════
   CONTROL VARIABLE
═══════════════════════════════════════ */

btnAddCtrl.addEventListener("click", () => {

  const input = document.createElement("input");

  input.type = "text";

  input.className = "var-input ctrl-item";

  input.placeholder = "ตัวแปรควบคุม";

  ctrlList.appendChild(input);
});

/* ═══════════════════════════════════════
   EVENTS
═══════════════════════════════════════ */

btnAddRow.addEventListener("click", () => {
  addRow();
});

btnDelRow.addEventListener("click", removeRow);

btnCalc.addEventListener("click", calculatePV);

btnDraw.addEventListener("click", () => {
  calculatePV();
  drawChart();
});

btnSave.addEventListener("click", saveJSON);

btnPrint.addEventListener("click", () => {
  window.print();
});

btnReset.addEventListener("click", resetAll);

unitP.addEventListener("change", buildTableHead);
unitV.addEventListener("change", buildTableHead);

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */

generateMembers();

buildTableHead();

buildFoot();

for (let i = 0; i < DEFAULT_ROWS; i++) {
  addRow();
}