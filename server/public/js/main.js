function logout() {
  fetch('/api/v1/logout',{ method:'POST' }).then(() => window.location.reload() )
}
fetch('/api/v1/session', {
  credentials: 'same-origin'
}).then(res => res.ok ? res.json() : undefined)
.then(sessionInfo => {
  if (!sessionInfo || !sessionInfo.user) return
  const username = document.getElementById('username')
  username.innerHTML += `${sessionInfo.user.username}#${sessionInfo.user.discriminator}`
  username.removeAttribute('hidden')
  const server_list = document.getElementById("server-list")
  server_list.innerHTML += sessionInfo.guilds.map(x => x.name).join(', ')
  server_list.removeAttribute('hidden')
  document.getElementById("login").setAttribute('hidden','true')
  document.getElementById("dashboard").removeAttribute('hidden')
  document.getElementById("logout").removeAttribute("hidden")
})
