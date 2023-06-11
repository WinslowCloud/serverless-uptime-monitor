(() => {
  var TARGETS = [{
          name: "Add your target",
          url: "https://example.com"
      },
      {
        name: "Add your target",
        url: "https://xmr.example.com",
        checker: checkMoneroDaemon
    }
  ];
  async function checkMoneroDaemon() {
      try {
          const response = await fetch(TARGETS.find(function(t) {
              return t.name === "Monero";
          }).url + "/json_rpc", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: '0',
                  method: 'get_info'
              })
          });
          return response.ok ? 'up' : 'down';
      } catch (error) {
          return 'down';
      }
  }

  function getUptimeColor(percentage) {
      if (percentage === 100) return 'color-perfect';
      if (percentage > 90) return 'color-success';
      if (percentage > 70) return 'color-warning';
      return 'color-danger';
  }

  function getUptimeColorRGB(percentage) {
      if (percentage === 100) return '76, 159, 93';
      if (percentage > 90) return '76, 175, 80';
      if (percentage > 70) return '255, 171, 0';
      return '244, 67, 54';
  }

  function getUptimeColorDRGB(percentage) {
      if (percentage === 100) return 'rgb(64, 118, 73);';
      if (percentage > 90) return 'rgb(64, 145, 68);';
      if (percentage > 70) return 'rgb(202, 122, 0);';
      return 'rgb(197, 57, 34);';
  }
  addEventListener('fetch', function(event) {
      const response = handleRequest(event);
      event.respondWith(response);
      TARGETS.forEach(function(target) {
          event.waitUntil(performCheck(target));
      });
  })

  async function handleRequest(request) {
      let results = [];
      for (let target of TARGETS) {
          let checks = await UPTIME_KV.get(target.url, "json");
          if (!Array.isArray(checks)) {
              checks = [];
          }
          let upChecks = checks.filter(function(check) {
              return check.status === 'up';
          }).length;
          let uptimePercentage = (upChecks / checks.length) * 100;
          results.push({
              service: target.name,
              url: target.url,
              uptimePercentage: uptimePercentage,
              checks: checks.map(function(check) {
                  return {
                      status: check.status,
                      checked_at: Math.round(check.checked_at / 1000), // Convert to seconds
                  };
              }),
          });
      }
      let css = `
  * { 
  font-family: 'Roboto', sans-serif; 
}
body { 
  background-color: #FAFAFA; 
  color: #212121;
  padding: 16px;
}
#highres-adapt{
 max-width:3860px; 
}
#header {
  background-color: #a689ef;
  padding: 16px;
  color: #FFFFFF;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 16px;
}
#main-title { 
  font-size: 2em; 
  font-weight: 500; 
}
.site-section {
  padding: 16px;
  height:auto;
  margin-bottom: 16px; 
  border: 1px solid #E0E0E0; 
  border-radius: 4px; 
  background: #FFFFFF; 
  box-shadow: 0 2px 1px -1px rgba(0,0,0,0.2), 
              0 1px 1px 0 rgba(0,0,0,0.14), 
              0 1px 3px 0 rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
}
.left-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-right: 8px;
}
.service-title {
  font-size: 1.5em; 
  font-weight: 500; 
}
.service-url {
  font-size: 1em; 
  font-weight: 300; 
  color: #757575;
  margin-bottom: 16px;
}
.uptime-bar-container {
  flex-grow: 1;
  overflow: auto;
}  
.uptime-ind{
  font-size: 1.1em;
  font-weight:300;
}
.uptime-bar {
  display: flex;
  align-items: center;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  padding: 8px;
  background: #FAFAFA;
  overflow-x: auto;
}
.uptime-bar::-webkit-scrollbar {
  display: none;
}
.uptime-block {
  flex: 1 1 auto;
  height: 2em;
  border-radius: 4px;
  margin: 0.5px;
  background: #E0E0E0;
}
.uptime-block:active {
  filter: brightness(85%);
}
.uptime-success {
  background-color: #4CAF50;
}
.uptime-warning {
  background-color: #EFDF27;
}
.uptime-danger {
  background-color: #FF9800;
}
.uptime-failure {
  background-color: #F44336;
}
.color-perfect {
  color: #4C6D5D;
}
.color-success {
  color: #4CAF50;
}
.color-warning {
  color: #FFAB00;
}
.color-danger {
  color: #F44336;
}
.bubble {
  position: absolute;
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  padding: 8px;
  z-index: 1;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,0.2),
              0 1px 1px 0 rgba(0,0,0,0.14),
              0 1px 3px 0 rgba(0,0,0,0.12);
  min-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}    
.uptime-block:hover .bubble,
.uptime-block:active .bubble {
  display: block;
}
.bubble-title {
  font-size: 1.2em;
}
.progress-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  max-width: 138px;
  aspect-ratio: 1;
  border-radius: 50%;  
}
@media (max-width: 600px) {
  .uptime-bar {
    padding: 4px;
    border-radius: 2px;
  }
  #main-title { 
    font-size: 2em; 
  }
  .site-section {
    padding: 12px 8px 12px 8px;
  }
  .service-title {
    font-size: 1.2em; 
    margin-bottom: 4px;
  }
  .service-url {
    font-size: 0.7em; 
    margin-bottom: 12px;
  }
  .uptime-ind { 
    font-size: 0.8em; 
    margin-bottom: 12px;
  }
  .uptime-bar {
    flex-wrap: nowrap;
  }
  .uptime-block {
    height: 1.5em; 
  }
}
`;
      let html = `
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Uptime Monitor</title>
  <style>${css}</style>
  </head>
  <body>
  <div id="highres-adapt">
  <div id="header">
    <span id="main-title">Uptime Monitor</span>
  </div>
  `;
      for (let result of results) {
          let colorClass = getUptimeColor(result.uptimePercentage);
          const colorClass2 = getUptimeColorRGB(result.uptimePercentage);
          const colorClass3 = getUptimeColorDRGB(result.uptimePercentage);
          const pbarCSS = `
    background: 
      radial-gradient(closest-side, white 79%, transparent 80% 100%),
      conic-gradient(rgb(${colorClass2}) ${result.uptimePercentage}%, rgba(${colorClass2}, 0.2) 0);  `;

          html += `
      <div class="site-section">
      <div class="left-container">
      <span class="service-title">${result.service}</span> <span class="service-url">(<a href="${result.url}">${result.url}</a>)</span>
      <div class="uptime-bar-container">
      <div class="uptime-bar">
    `;

          let checksArray = result.checks;
          for (let i = 0; i < checksArray.length; i += 12) {
              let blockChecks = checksArray.slice(i, i + 12);
              let failedChecks = blockChecks.filter(function(check) {
                  return check.status === 'down';
              }).length;
              if (failedChecks === 0) {
                  colorClass = 'uptime-success'; // All checks passed
              } else if (failedChecks <= 3) {
                  colorClass = 'uptime-warning'; // 1-2 checks failed
              } else if (failedChecks <= 5) {
                  colorClass = 'uptime-danger'; // 3-4 checks failed
              } else {
                  colorClass = 'uptime-failure'; // All checks failed
              }
              let blockData = JSON.stringify(blockChecks);
              html += `<div class="uptime-block ${colorClass}" data-b-t="${colorClass}" data-b-c='${blockData}'></div>`;
          }
          html += `</div></div></div>
    <div class="progress-bar" style="${pbarCSS}">
    <div>
    <span class="uptime-ind" style="color: ${colorClass3}">${result.uptimePercentage.toFixed(2)}%</span>
    </div>
    </div>
    </div>`;
      }
      let clientSideScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const eventType = isMobile ? 'touchstart' : 'mouseenter';

      const uptimeBlocks = Array.from(document.querySelectorAll('.uptime-block'));

      uptimeBlocks.forEach(function(block) {
        block.addEventListener(eventType, createBubble);
        block.addEventListener('mouseleave', removeBubble);
        block.addEventListener('click', toggleBubble);
      });

      function createBubble(event) {
        removeBubble();
        const block = event.target;
        const blockData = JSON.parse(block.getAttribute('data-b-c'));
        const blockTitle = block.getAttribute('data-b-t');
        let bubbleTitle;
        switch (blockTitle) {
          case 'uptime-success':
            bubbleTitle = 'No issues found.';
            break;
          case 'uptime-warning':
            bubbleTitle = 'Issues found!';
            break;
          case 'uptime-danger':
            bubbleTitle = 'Service unstable!';
            break;
          case 'uptime-failure':
          default:
            bubbleTitle = 'Service unavailable!';
            break;
        }
      
        let bubbleContent = '';
        blockData.forEach(function (check) {
          let date = new Date(check.checked_at * 1000);
          let year = date.getFullYear();
          let month = ('0' + (date.getMonth() + 1)).slice(-2);
          let day = ('0' + date.getDate()).slice(-2);
          let hours = ('0' + date.getHours()).slice(-2);
          let minutes = ('0' + date.getMinutes()).slice(-2);
          let seconds = ('0' + date.getSeconds()).slice(-2);
          let dateString = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
          let statusString = '<span style="color: ' + (check.status === 'up' ? 'green' : 'red') + '">' + check.status.charAt(0).toUpperCase() + check.status.slice(1) + '</span>';
          bubbleContent += '<div>' + dateString + ' : ' + statusString + '</div>';
        });
      
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = '<div class="bubble-title" style="color: ' + getDarkerColor(blockTitle) + '">' + bubbleTitle + '</div>' + bubbleContent;
        document.body.appendChild(bubble);
      
        const blockRect = block.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
      
        let bubbleLeft;
        if (blockRect.left + blockRect.width / 2 - bubbleRect.width / 2 >= 0) {
          bubbleLeft = blockRect.left + blockRect.width / 2 - bubbleRect.width / 2;
        } else {
          bubbleLeft = 0;
        }
      
        let bubbleTop;
        if (blockRect.top - bubbleRect.height >= 0) {
          bubbleTop = blockRect.top - bubbleRect.height;
        } else {
          bubbleTop = blockRect.top + blockRect.height;
        }
      
        if (bubbleLeft + bubbleRect.width > viewportWidth) {
          bubbleLeft = viewportWidth - bubbleRect.width;
        }
      
        if (bubbleTop + bubbleRect.height > viewportHeight) {
          bubbleTop = blockRect.top - bubbleRect.height;
        }
      
        const scrollY = window.scrollY || window.pageYOffset;
        bubble.style.left = bubbleLeft + 'px';
        bubble.style.top = bubbleTop + scrollY + 'px';
      }
      
      function removeBubble() {
        const existingBubble = document.querySelector('.bubble');
        if(existingBubble) existingBubble.remove();
      }
      function toggleBubble(event) {
        event.preventDefault();
        const bubble = event.target.querySelector('.bubble');
        if (bubble) {
          removeBubble();
        } else {
          createBubble(event);
          if (window.innerHeight + window.pageYOffset < document.body.offsetHeight) {
            window.scrollTo(0, window.pageYOffset + bubble.offsetHeight);
          }
        }
      }

      function getDarkerColor(colorClass) {
        let color;
        switch(colorClass) {
          case 'uptime-success':
            color = '#388E3C'; // darker green
            break;
          case 'uptime-warning':
            color = '#FFA000'; // darker yellow
            break;
          case 'uptime-danger':
            color = '#F57C00'; // darker orange
            break;
          case 'uptime-failure':
          default:
            color = '#D32F2F'; // darker red
            break;
        }
        return color;
      }
    });
  </script>
`;

      html += clientSideScript;
      html += `</div></body></html>`

      return new Response(html, {
          headers: {
              'content-type': 'text/html'
          },
          status: 200
      })
  }

  async function performCheck(target) {
      const now = Date.now();
      let checks = await UPTIME_KV.get(target.url, "json") || [];
      if (!checks.length || now - checks[checks.length - 1].checked_at >= 300000) {
          let status = 'down';
          try {
              if (target.checker) {
                  status = await target.checker();
              } else {
                  let checkResponse = await fetch(target.url);
                  if (checkResponse.ok) status = 'up';
              }
          } catch (err) {
              status = 'down';
          }
          checks.push({
              status: status,
              checked_at: now
          });
          checks = checks.slice(-816);
          await UPTIME_KV.put(target.url, JSON.stringify(checks));
      }
  }
})();
