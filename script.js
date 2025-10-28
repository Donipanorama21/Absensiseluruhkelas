const API_BASE_URL = "http://localhost:5001/api";

document.getElementById("login-form").addEventListener("submit", async e=>{
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,password})
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Login gagal");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userNama", data.user.nama);
        window.location.href = "dashboard.html";
    } catch(err){ alert("❌ "+err.message);}
});
