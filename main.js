// Uses Launch Library 2 (LL2) API
// Docs: https://thespacedevs.com/llapi
// Getting Started Guide: https://github.com/TheSpaceDevs/Tutorials/blob/main/tutorials/getting_started_LL2/README.md

const rocketSelect = document.getElementById('rocket-select');
const fetchLaunchesBtn = document.getElementById('fetch-launches-btn');
const launchesContainer = document.getElementById('launches-container');

// We'll fetch 50 upcoming launches to gather rocket names
const UPCOMING_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=50';

/**
 * 1) Populate the <select> with rocket names from upcoming launches.
 */
async function populateRocketDropdown() {
  try {
    const response = await fetch(UPCOMING_URL);
    const data = await response.json(); // makes a JS object out of the JSON data

    // make data.results, OR if we get nothing, makes an empty array
    const launches = data.results || []; 
    // Use a Set to avoid duplicates
    const rocketNames = new Set();

    // Extract rocket name from each launch
    launches.forEach(launch => {
      // Typically found under launch.rocket.configuration.full_name or .name
      const config = launch.rocket?.configuration;
      if (config && (config.full_name || config.name)) {
        // Prefer full_name if available, else fallback to name
        const rocketName = config.full_name || config.name;
        rocketNames.add(rocketName);
      }
    });

    // Convert the Set to an array and sort alphabetically
    const sortedNames = [...rocketNames].sort(); // needed because no sort() command in a Set 

    // Create <option> elements for each rocket name
    sortedNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      rocketSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Error populating rocket dropdown:', error);
  }
}

/**
 * 2) Fetch & display upcoming launches filtered by the selected rocket (if any).
 */
async function fetchFilteredLaunches() {
  // Clear current display
  launchesContainer.innerHTML = '';

  // Get selected rocket name
  const selectedRocket = rocketSelect.value.trim(); // e.g. "Falcon 9 Block 5"

  // Build the query. If a rocket is selected, we use the 'search' parameter.
  // If user chooses "-- All Rockets --", selectedRocket will be "" => no extra param.
  let url = UPCOMING_URL;
  if (selectedRocket) {
    // Add &search=RocketName
    url += `&search=${encodeURIComponent(selectedRocket)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const launches = data.results;

    if (!Array.isArray(launches) || launches.length === 0) {
      launchesContainer.innerHTML = '<p>No upcoming launches found.</p>';
      return;
    }

    // Display each launch
    launches.forEach(launch => {
      const name = launch.name || 'Unknown Launch';
      const net = launch.net || 'Unknown Date/Time'; // No Earlier Than date/time
      const mission = launch.mission?.description || 'No mission details';

      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.marginBottom = '10px';
      div.style.padding = '10px';

      const title = document.createElement('h2');
      title.textContent = name;
      div.appendChild(title);

      const timePara = document.createElement('p');
      timePara.textContent = "Launch Time (NET): " + net;
      div.appendChild(timePara);

      const missionPara = document.createElement('p');
      missionPara.textContent = "Mission: " + mission;
      div.appendChild(missionPara);

      // Rocket info, if we want to show the name again or other details
      const config = launch.rocket?.configuration;
      if (config && (config.full_name || config.name)) {
        const rocketName = config.full_name || config.name;
        const rocketPara = document.createElement('p');
        rocketPara.textContent = "Rocket: " + rocketName;
        div.appendChild(rocketPara);
      }

      launchesContainer.appendChild(div);
    });
  } catch (error) {
    console.error('Error fetching filtered launches:', error);
    launchesContainer.innerHTML = `
      <p style="color:red;">Failed to fetch launches. Please try again later.</p>
    `;
  }
}

// On page load, populate the dropdown
populateRocketDropdown();

// When user clicks "Fetch Launches", filter by selected rocket
fetchLaunchesBtn.addEventListener('click', fetchFilteredLaunches);
