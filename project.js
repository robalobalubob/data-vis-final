function _1(md){return(
md`# Project Workspace`
)}

function _2(md){return(
md`### Questions:
* Does location impact median cost for procedures?
* How does the median cost of procedures vary with how many patients visit a given hospital?
* How does cost vary between hospital ownership types?`
)}

function _layout(html, $0, $1, $2, $3) {
  return html`
    <div id="container">
      <div id="controls">
        <div>${$0}</div>
        <div>${$1}</div>
        <div id="selectedOwnershipContainer">
          <label>Filter by Ownership:</label>
          ${$2}
          <label>Filter by Service ID:</label>
          ${$3}
        </div>
      </div>
      <div id="content">
        <div id="map"></div>
        <div id="bar-chart"></div>
      </div>
    </div>
  `;
}


function _hospitals(d3){return(
d3.csv("https://raw.githubusercontent.com/dakoop/il-hospital-report-card/refs/heads/main/hospitals.csv", d3.autoType)
)}

function _measures(d3){return(
d3.csv("https://raw.githubusercontent.com/dakoop/il-hospital-report-card/refs/heads/main/measures.csv", d3.autoType)
)}

function _values(d3){return(
d3.csv("https://raw.githubusercontent.com/dakoop/il-hospital-report-card/refs/heads/main/values.csv", d3.autoType)
)}

function _relevantUnits(){return(
["patients", "dollars"]
)}

function _relevantMeasures(measures,relevantUnits){return(
measures.filter(d =>
  relevantUnits.includes(d.default_unit.toLowerCase())
).map(d => {
  let measureType = "Unknown";
  let procedureName = d.name_friendly;
  if (d.name_friendly.includes(": ")) {
    [measureType, procedureName] = d.name_friendly.split(": ");
  }
  return {
    ...d,
    measureType: measureType.trim(),
    procedureName: procedureName.trim(),
  };
})
)}

function _numberOfPatientsMeasures(relevantMeasures){return(
relevantMeasures.filter(d =>
  d.default_unit.toLowerCase() === "patients" && d.measureType === "Number of Patients"
)
)}

function _measureIdToProcedureName(numberOfPatientsMeasures){return(
new Map(numberOfPatientsMeasures.map(d => [d.measure_id, d.procedureName]))
)}

function _procedureNameToMeasureId(numberOfPatientsMeasures){return(
new Map(numberOfPatientsMeasures.map(d => [d.procedureName, d.measure_id]))
)}

function _medianChargesMeasures(relevantMeasures){return(
relevantMeasures.filter(d =>
  d.default_unit.toLowerCase() === "dollars" && d.measureType === "Median Charges"
)
)}

function _patientsMeasureIds(numberOfPatientsMeasures){return(
numberOfPatientsMeasures.map(d => d.measure_id)
)}

function _valuesPatients(values,patientsMeasureIds){return(
values.filter(d => patientsMeasureIds.includes(d.measure_id))
)}

function _dateFormat(d3){return(
d3.timeFormat("%Y-%m-%d")
)}

function _timeframesSet(valuesPatients,dateFormat){return(
new Set(valuesPatients.map(d => {
    const startDate = new Date(d.date_start);
    const endDate = new Date(d.date_end);
    return JSON.stringify({
      date_start: startDate,
      date_end: endDate,
      label: `${dateFormat(startDate)} to ${dateFormat(endDate)}`
    });
  }))
)}

function _timeframes(timeframesSet){return(
Array.from(timeframesSet).map(d => {
  const obj = JSON.parse(d);
  obj.date_start = new Date(obj.date_start);
  obj.date_end = new Date(obj.date_end);
  return obj;
})
)}

function _18(timeframes,d3){return(
timeframes.sort((a, b) => d3.ascending(a.date_start, b.date_start))
)}

function _timeframeOptions(timeframes){return(
timeframes.map(d => ({
  label: d.label,
  value: d,
}))
)}

function _selectedTimeframe(Inputs,timeframeOptions){return(
Inputs.select(timeframeOptions, {
  label: "Select Timeframe",
  format: d => d.label,
  reduce: d => d.value,
  value: timeframeOptions[0]?.value,
})
)}

function _filteredValuesByTimeframe(valuesPatients,selectedTimeframe){return(
valuesPatients.filter(d =>
  d.date_start.getTime() === selectedTimeframe.value.date_start.getTime() &&
  d.date_end.getTime() === selectedTimeframe.value.date_end.getTime()
)
)}

function _procedureCounts(d3,filteredValuesByTimeframe,measureIdToProcedureName){return(
d3.rollups(
  filteredValuesByTimeframe,
  v => d3.sum(v, d => d.value || 0),
  d => measureIdToProcedureName.get(d.measure_id)
)
)}

function _topProcedures(procedureCounts,d3){return(
procedureCounts
  .sort((a, b) => d3.descending(a[1], b[1]))
  .slice(0, 5)
  .map(d => d[0])
)}

function _costMeasures(medianChargesMeasures,topProcedures){return(
medianChargesMeasures.filter(d => topProcedures.includes(d.procedureName))
)}

function _costMeasureMap(costMeasures){return(
new Map(costMeasures.map(d => [d.measure_id, d.procedureName]))
)}

function _hospitalMap(hospitals){return(
new Map(hospitals.map(d => [d.entity_id, d]))
)}

function _measureMap(measures){return(
new Map(measures.map(d => [d.measure_id, d]))
)}

function _procedureOptions(costMeasures,procedureCounts){return(
costMeasures.map(d => {
  const countEntry = procedureCounts.find(pc => pc[0] === d.procedureName);
  const count = countEntry ? countEntry[1] : 0;
  return {
    value: d.measure_id,
    label: d.procedureName,
    count: count,
  };
})
)}

function _procedureOptionsFinal(procedureOptions,d3){return(
procedureOptions.map(d => ({
  value: d.value,
  label: `${d.label} (${d.count} patients)`,
  count: d.count,
})).sort((a, b) => d3.descending(a.count, b.count))
)}

function _selectedProcedure(Inputs,procedureOptionsFinal){return(
Inputs.select(procedureOptionsFinal, {
  label: "Select Procedure",
  format: d => d.label,
  reduce: d => d.value,
  value: procedureOptionsFinal[0]?.value,
})
)}

function _filteredValues(values,selectedProcedure,selectedTimeframe){return(
values.filter(d =>
  d.measure_id === selectedProcedure.value &&
  d.date_start.getTime() === selectedTimeframe.value.date_start.getTime() &&
  d.date_end.getTime() === selectedTimeframe.value.date_end.getTime()
)
)}

function _selectedProcedureName(costMeasureMap,selectedProcedure){return(
costMeasureMap.get(selectedProcedure.value)
)}

function _patientsMeasureIdForSelectedProcedure(procedureNameToMeasureId,selectedProcedureName){return(
procedureNameToMeasureId.get(selectedProcedureName)
)}

function _patientsValuesForSelectedProcedure(valuesPatients,patientsMeasureIdForSelectedProcedure,selectedTimeframe){return(
valuesPatients.filter(d =>
    d.measure_id === patientsMeasureIdForSelectedProcedure &&
    d.date_start.getTime() === selectedTimeframe.value.date_start.getTime() &&
    d.date_end.getTime() === selectedTimeframe.value.date_end.getTime()
  )
)}

function _ownershipOptions(hospitals){return(
Array.from(new Set(hospitals.map(d => d.ownership || "Unknown" )))
  .sort()
)}

function _selectedOwnership(Inputs,ownershipOptions){return(
Inputs.radio(["All", ...ownershipOptions], {
  label: "Filter by Ownership",
  value: "All",
})
)}

function _serviceIdOptions(hospitals){return(
Array.from(new Set(hospitals.map(d => d.aha_service_id)))
  .sort()
)}

function _selectedId(Inputs,serviceIdOptions){return(
Inputs.radio(["All", ...serviceIdOptions], {
  label: "Filter by Service Id",
  value: "All",
})
)}

function _mergedData(patientsValuesForSelectedProcedure,filteredValues,hospitalMap,measureMap,selectedOwnership,selectedId)
{
  const hospitalIdToPatientCount = new Map();

  patientsValuesForSelectedProcedure.forEach(d => {
    hospitalIdToPatientCount.set(d.entity_id, d.value);
  });

  const mergedData = filteredValues.map(d => {
    const hospital = hospitalMap.get(d.entity_id);
    const measure = measureMap.get(d.measure_id);
    const patientCount = hospitalIdToPatientCount.get(d.entity_id) || 0;
    const ownership = hospital?.ownership || "Unknown";
    if (!selectedOwnership.includes(ownership) && selectedOwnership != "All") return null;
    if (selectedId !== "All" && hospital?.aha_service_id !== selectedId) return null;
    return {
      ...d,
      hospital_name: hospital?.name,
      service_id: hospital?.aha_service_id,
      ownership: hospital?.ownership,
      geo_lat: hospital?.geo_lat,
      geo_long: hospital?.geo_long,
      value: d.value,
      patient_count: patientCount,
    };
  }).filter(d => d && d.geo_lat != null && d.geo_long != null);
  return mergedData
}


function _sizeScale(d3,mergedData){return(
d3.scaleSqrt()
  .domain(d3.extent(mergedData, d => d.patient_count || 1))
  .range([5, 15])
)}

function _colorVal(mergedData,d3){return(
mergedData.map(d => d.value).sort(d3.ascending)
)}

function _lowerQuantile(d3,colorVal){return(
d3.quantile(colorVal, 0.05)
)}

function _upperQuantile(d3,colorVal){return(
d3.quantile(colorVal, 0.95)
)}

function _colorScale(d3,lowerQuantile,upperQuantile){return(
d3.scaleSequential()
  .domain([lowerQuantile, upperQuantile])
  .interpolator(d3.interpolateBlues)
)}

function _selectedHospitals(){return(
new Set()
)}

function _onHospitalSelect(selectedHospitals,$0){return(
function onHospitalSelect(entity_id) {
  const newSelectedHospitals = new Set(selectedHospitals);
  if (newSelectedHospitals.has(entity_id)) {
    newSelectedHospitals.delete(entity_id);
  } else {
    newSelectedHospitals.add(entity_id);
  }
  $0.value = newSelectedHospitals;
}
)}

function _markerGroup(L,map){return(
L.layerGroup().addTo(map)
)}

function _48(markerGroup,mergedData,L,sizeScale,colorScale,selectedHospitals,onHospitalSelect)
{
  // Clear existing markers
  markerGroup.clearLayers();

  // Create new markers
  mergedData.forEach(d => {
    const marker = L.circleMarker([d.geo_lat, d.geo_long], {
      radius: sizeScale(d.patient_count || 1),
      fillColor: colorScale(d.value),
      color: selectedHospitals.has(d.entity_id) ? '#ff0' : '#666',
      weight: selectedHospitals.has(d.entity_id) ? 3 : 0.5,
      opacity: 1,
      fillOpacity: 0.7,
    });

    marker.data = d;
    
    const tooltipContent = `
      <strong>${d.hospital_name}</strong><br>
      Ownership: ${d.ownership}<br>
      Service ID: ${d.service_id}<br>
      Median Charges: $${d.value.toFixed(2)}<br>
      Patients: ${d.patient_count}
    `;

    marker.bindTooltip(tooltipContent, {
      direction: 'top',      
      offset: [0, -10],      
      permanent: false,      
      className: 'custom-tooltip',
    });

    marker.on('click', () => {
      onHospitalSelect(d.entity_id);
    });

    markerGroup.addLayer(marker);
  });
}


function _49(markerGroup,selectedHospitals)
{
  markerGroup.eachLayer(layer => {
    const isSelected = selectedHospitals.has(layer.data.entity_id);
    layer.setStyle({
      color: isSelected ? '#ff0' : '#000',
      weight: isSelected ? 3 : 1,
    });
  });
}


function _highlightMarker(markerGroup){return(
function highlightMarker(entity_id) {
  markerGroup.eachLayer(layer => {
    if (layer.data && layer.data.entity_id === entity_id) {
      layer.setStyle({ color: '#ff0', weight: 3 });
    }
  });
}
)}

function _resetMarker(markerGroup,selectedHospitals){return(
function resetMarker(entity_id) {
  markerGroup.eachLayer(layer => {
    const isSelected = selectedHospitals.has(layer.data.entity_id);
    layer.setStyle({
      color: isSelected ? '#ff0' : '#000',
      weight: isSelected ? 3 : 1,
    });
  });
}
)}

function _barChartSVG($0,d3)
{
  const container = $0.querySelector("#bar-chart");
  const svg = d3.select(container)
    .append("svg")
    .attr("width", container.clientWidth)
    .attr("height", container.clientHeight);

  return svg;
}


function _wrap(d3){return(
function wrap(text, width) {
  text.each(function() {
    const text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")) || 0;
    let line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    let word;
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
)}

function _updateBarChart(mergedData,selectedHospitals,barChartSVG,d3,colorScale,highlightMarker,resetMarker,wrap,measureMap,selectedProcedure){return(
function updateBarChart() {
  const data = mergedData.filter(d => selectedHospitals.has(d.entity_id));

  // Clear previous content
  barChartSVG.selectAll("*").remove();

  if (data.length === 0) {
    barChartSVG.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .text("Select hospitals on the map to compare their procedure costs.")
      .style("font-size", "14px");
    return;
  }

  const margin = { top: 40, right: 20, bottom: 140, left: 80 };
  const width = barChartSVG.attr("width") - margin.left - margin.right;
  const height = barChartSVG.attr("height") - margin.top - margin.bottom;

  const svg = barChartSVG.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.hospital_name))
    .range([0, width])
    .padding(0.1);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height, 0]);

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("x", -10)
      .attr("y", 0)
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.hospital_name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => colorScale(d.value))
      .on('mouseover', (event, d) => {
        highlightMarker(d.entity_id);
      })
      .on('mouseout', (event, d) => {
        resetMarker(d.entity_id);
      });

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 5)
    .attr("x", -height / 2)
    .attr("dy", "1.5em")
    .style("text-anchor", "middle")
    .text("Median Charges ($)");

  // X axis labels
  svg.selectAll(".tick text")
    .call(wrap, x.bandwidth());

  const procedureName = measureMap.get(selectedProcedure.value).name_friendly || selectedProcedure.label;

  // Chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .text(`${procedureName}`);
}
)}

function _55(mergedData,$0,updateBarChart)
{
  mergedData;
  $0.value;
  updateBarChart();
}


function _map(L,$0)
{
  const map = L.map($0.querySelector("#map")).setView([39.8, -89.6], 6); // Center on Illinois

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  return map;
}


function _57(L,map){return(
fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
  .then(response => response.json())
  .then(data => {
    const illinoisBoundary = data.features.find(f => f.properties.name === 'Illinois');
    L.geoJSON(illinoisBoundary, {
      style: {
        color: '#000',
        weight: 1,
        fill: false, // Avoid filled polygons to prevent hiding markers
      },
    }).addTo(map);
})
)}

function _58(map,L,lowerQuantile,upperQuantile,colorScale)
{ 
  if (map.colorLegendControl) {
    map.removeControl(map.colorLegendControl);
  }

  map.colorLegendControl = L.control({ position: 'bottomright' });

  map.colorLegendControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const title = L.DomUtil.create('div', '', div);
    title.innerHTML = '<strong>Median Charges ($)</strong>';

    const legendContainer = L.DomUtil.create('div', 'legend-container', div);
    legendContainer.style.display = 'flex';
    legendContainer.style.alignItems = 'center';
    legendContainer.style.height = '150px';

    const legendWidth = 20;
    const legendHeight = 150;

    const effectiveLowerQuantile = lowerQuantile ?? 0;
    const effectiveUpperQuantile = upperQuantile ?? 10;

    const labelsDiv = L.DomUtil.create('div', 'labels', legendContainer);
    labelsDiv.style.display = 'flex';
    labelsDiv.style.flexDirection = 'column';
    labelsDiv.style.justifyContent = 'space-between';
    labelsDiv.style.height = `${legendHeight}px`;
    labelsDiv.style.marginLeft = '5px';
    labelsDiv.style.marginRight = '5px';
    labelsDiv.innerHTML = `
      <div style="text-align: left;">${effectiveUpperQuantile?.toFixed(0)}</div>
      <div style="text-align: left;">${effectiveLowerQuantile?.toFixed(0)}</div>
    `;

    const canvas = document.createElement('canvas');
    canvas.width = legendWidth;
    canvas.height = legendHeight;

    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, legendHeight);
    const gradientSteps = 10;
    for (let i = 0; i <= gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const value = effectiveLowerQuantile + ratio * (effectiveUpperQuantile - effectiveLowerQuantile);
      const color = colorScale(value);
      gradient.addColorStop(1 - ratio, color);
    }

    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, legendWidth, legendHeight);

    legendContainer.appendChild(canvas);

    return div;
  };

  map.colorLegendControl.addTo(map);
}


function _59(map,L,d3,sizeScale)
{

  if (map.sizeLegendControl) {
    map.removeControl(map.sizeLegendControl);
  }

  map.sizeLegendControl = L.control({ position: 'bottomleft' });

  map.sizeLegendControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');

    const title = L.DomUtil.create('div', '', div);
    title.innerHTML = '<strong>Number of Patients</strong>';
    
    const minValue = d3.min(sizeScale.domain());
    const maxValue = d3.max(sizeScale.domain());

    const steps = 3;
    const values = [];
    for (let i = 0; i <= steps; i++) {
      values.push(minValue + i * (maxValue - minValue) / steps);
    }
    values.reverse();

    const maxRadius = sizeScale.range()[1];
    const spacing = 30;

    const svgHeight = maxRadius * 2 + spacing * steps;
    const svgWidth = 100;

    let svgContent = '';
    let yOffset = maxRadius;

    values.forEach((value, index) => {
      const radius = sizeScale(value);
      svgContent += `
        <circle cx="${svgWidth / 2}" cy="${yOffset}" r="${radius}" fill="none" stroke="#000" stroke-width="1"/>
        <text x="${svgWidth / 2 + radius + 5}" y="${yOffset + 5}" text-anchor="start" font-size="10">${Math.round(value)}</text>
      `;
      yOffset += radius * 2 + spacing;
    });

    const svg = `
      <svg width="${svgWidth}" height="${yOffset}">
        ${svgContent}
      </svg>
    `;

    div.innerHTML += svg;

    return div;
  };
  map.sizeLegendControl.addTo(map);
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("viewof layout")).define("viewof layout", ["html","viewof selectedTimeframe","viewof selectedProcedure","viewof selectedOwnership","viewof selectedId"], _layout);
  main.variable(observer("layout")).define("layout", ["Generators", "viewof layout"], (G, _) => G.input(_));
  main.variable(observer("hospitals")).define("hospitals", ["d3"], _hospitals);
  main.variable(observer("measures")).define("measures", ["d3"], _measures);
  main.variable(observer("values")).define("values", ["d3"], _values);
  main.variable(observer("relevantUnits")).define("relevantUnits", _relevantUnits);
  main.variable(observer("relevantMeasures")).define("relevantMeasures", ["measures","relevantUnits"], _relevantMeasures);
  main.variable(observer("numberOfPatientsMeasures")).define("numberOfPatientsMeasures", ["relevantMeasures"], _numberOfPatientsMeasures);
  main.variable(observer("measureIdToProcedureName")).define("measureIdToProcedureName", ["numberOfPatientsMeasures"], _measureIdToProcedureName);
  main.variable(observer("procedureNameToMeasureId")).define("procedureNameToMeasureId", ["numberOfPatientsMeasures"], _procedureNameToMeasureId);
  main.variable(observer("medianChargesMeasures")).define("medianChargesMeasures", ["relevantMeasures"], _medianChargesMeasures);
  main.variable(observer("patientsMeasureIds")).define("patientsMeasureIds", ["numberOfPatientsMeasures"], _patientsMeasureIds);
  main.variable(observer("valuesPatients")).define("valuesPatients", ["values","patientsMeasureIds"], _valuesPatients);
  main.variable(observer("dateFormat")).define("dateFormat", ["d3"], _dateFormat);
  main.variable(observer("timeframesSet")).define("timeframesSet", ["valuesPatients","dateFormat"], _timeframesSet);
  main.variable(observer("timeframes")).define("timeframes", ["timeframesSet"], _timeframes);
  main.variable(observer()).define(["timeframes","d3"], _18);
  main.variable(observer("timeframeOptions")).define("timeframeOptions", ["timeframes"], _timeframeOptions);
  main.variable(observer("viewof selectedTimeframe")).define("viewof selectedTimeframe", ["Inputs","timeframeOptions"], _selectedTimeframe);
  main.variable(observer("selectedTimeframe")).define("selectedTimeframe", ["Generators", "viewof selectedTimeframe"], (G, _) => G.input(_));
  main.variable(observer("filteredValuesByTimeframe")).define("filteredValuesByTimeframe", ["valuesPatients","selectedTimeframe"], _filteredValuesByTimeframe);
  main.variable(observer("procedureCounts")).define("procedureCounts", ["d3","filteredValuesByTimeframe","measureIdToProcedureName"], _procedureCounts);
  main.variable(observer("topProcedures")).define("topProcedures", ["procedureCounts","d3"], _topProcedures);
  main.variable(observer("costMeasures")).define("costMeasures", ["medianChargesMeasures","topProcedures"], _costMeasures);
  main.variable(observer("costMeasureMap")).define("costMeasureMap", ["costMeasures"], _costMeasureMap);
  main.variable(observer("hospitalMap")).define("hospitalMap", ["hospitals"], _hospitalMap);
  main.variable(observer("measureMap")).define("measureMap", ["measures"], _measureMap);
  main.variable(observer("procedureOptions")).define("procedureOptions", ["costMeasures","procedureCounts"], _procedureOptions);
  main.variable(observer("procedureOptionsFinal")).define("procedureOptionsFinal", ["procedureOptions","d3"], _procedureOptionsFinal);
  main.variable(observer("viewof selectedProcedure")).define("viewof selectedProcedure", ["Inputs","procedureOptionsFinal"], _selectedProcedure);
  main.variable(observer("selectedProcedure")).define("selectedProcedure", ["Generators", "viewof selectedProcedure"], (G, _) => G.input(_));
  main.variable(observer("filteredValues")).define("filteredValues", ["values","selectedProcedure","selectedTimeframe"], _filteredValues);
  main.variable(observer("selectedProcedureName")).define("selectedProcedureName", ["costMeasureMap","selectedProcedure"], _selectedProcedureName);
  main.variable(observer("patientsMeasureIdForSelectedProcedure")).define("patientsMeasureIdForSelectedProcedure", ["procedureNameToMeasureId","selectedProcedureName"], _patientsMeasureIdForSelectedProcedure);
  main.variable(observer("patientsValuesForSelectedProcedure")).define("patientsValuesForSelectedProcedure", ["valuesPatients","patientsMeasureIdForSelectedProcedure","selectedTimeframe"], _patientsValuesForSelectedProcedure);
  main.variable(observer("ownershipOptions")).define("ownershipOptions", ["hospitals"], _ownershipOptions);
  main.variable(observer("viewof selectedOwnership")).define("viewof selectedOwnership", ["Inputs","ownershipOptions"], _selectedOwnership);
  main.variable(observer("selectedOwnership")).define("selectedOwnership", ["Generators", "viewof selectedOwnership"], (G, _) => G.input(_));
  main.variable(observer("serviceIdOptions")).define("serviceIdOptions", ["hospitals"], _serviceIdOptions);
  main.variable(observer("viewof selectedId")).define("viewof selectedId", ["Inputs","serviceIdOptions"], _selectedId);
  main.variable(observer("selectedId")).define("selectedId", ["Generators", "viewof selectedId"], (G, _) => G.input(_));
  main.variable(observer("mergedData")).define("mergedData", ["patientsValuesForSelectedProcedure","filteredValues","hospitalMap","measureMap","selectedOwnership","selectedId"], _mergedData);
  main.variable(observer("sizeScale")).define("sizeScale", ["d3","mergedData"], _sizeScale);
  main.variable(observer("colorVal")).define("colorVal", ["mergedData","d3"], _colorVal);
  main.variable(observer("lowerQuantile")).define("lowerQuantile", ["d3","colorVal"], _lowerQuantile);
  main.variable(observer("upperQuantile")).define("upperQuantile", ["d3","colorVal"], _upperQuantile);
  main.variable(observer("colorScale")).define("colorScale", ["d3","lowerQuantile","upperQuantile"], _colorScale);
  main.define("initial selectedHospitals", _selectedHospitals);
  main.variable(observer("mutable selectedHospitals")).define("mutable selectedHospitals", ["Mutable", "initial selectedHospitals"], (M, _) => new M(_));
  main.variable(observer("selectedHospitals")).define("selectedHospitals", ["mutable selectedHospitals"], _ => _.generator);
  main.variable(observer("onHospitalSelect")).define("onHospitalSelect", ["selectedHospitals","mutable selectedHospitals"], _onHospitalSelect);
  main.define("initial markerGroup", ["L","map"], _markerGroup);
  main.variable(observer("mutable markerGroup")).define("mutable markerGroup", ["Mutable", "initial markerGroup"], (M, _) => new M(_));
  main.variable(observer("markerGroup")).define("markerGroup", ["mutable markerGroup"], _ => _.generator);
  main.variable(observer()).define(["markerGroup","mergedData","L","sizeScale","colorScale","selectedHospitals","onHospitalSelect"], _48);
  main.variable(observer()).define(["markerGroup","selectedHospitals"], _49);
  main.variable(observer("highlightMarker")).define("highlightMarker", ["markerGroup"], _highlightMarker);
  main.variable(observer("resetMarker")).define("resetMarker", ["markerGroup","selectedHospitals"], _resetMarker);
  main.variable(observer("barChartSVG")).define("barChartSVG", ["viewof layout","d3"], _barChartSVG);
  main.variable(observer("wrap")).define("wrap", ["d3"], _wrap);
  main.variable(observer("updateBarChart")).define("updateBarChart", ["mergedData","selectedHospitals","barChartSVG","d3","colorScale","highlightMarker","resetMarker","wrap","measureMap","selectedProcedure"], _updateBarChart);
  main.variable(observer()).define(["mergedData","mutable selectedHospitals","updateBarChart"], _55);
  main.variable(observer("map")).define("map", ["L","viewof layout"], _map);
  main.variable(observer()).define(["L","map"], _57);
  main.variable(observer()).define(["map","L","lowerQuantile","upperQuantile","colorScale"], _58);
  main.variable(observer()).define(["map","L","d3","sizeScale"], _59);
  return main;
}
