(async () => {
    try {
        const signupRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'tponew@college.edu',
                password: 'password123',
                role: 'TPO_ADMIN'
            })
        });

        let token;

        if (!signupRes.ok) {
            // If it already exists, let's login
            const loginRes = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'tponew@college.edu',
                    password: 'password123',
                    role: 'TPO_ADMIN'
                })
            });
            const loginData = await loginRes.json();
            token = loginData.token;
        } else {
            const signupData = await signupRes.json();
            token = signupData.token;
        }

        console.log('Got token');

        const statsRes = await fetch('http://localhost:5000/api/companies/stats/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!statsRes.ok) {
            console.error('Stats fetch failed:', await statsRes.text());
            return;
        }

        const statsData = await statsRes.json();
        console.dir(statsData, { depth: null });
    } catch (err) {
        console.error(err);
    }
})();
