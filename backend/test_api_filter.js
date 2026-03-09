const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}...`));
                }
            });
        }).on('error', reject);
    });
}

async function testFilter() {
    const baseUrl = 'http://localhost:5001/api/cakes';

    try {
        console.log('Testing All Cakes:');
        const resAll = await get(baseUrl);
        console.log(`Total count: ${resAll.cakes.length}`);

        console.log('\nTesting Eggless (true):');
        const resEggless = await get(`${baseUrl}?eggless=true`);
        console.log(`Count: ${resEggless.cakes.length}`);
        resEggless.cakes.forEach(c => console.log(` - ${c.name} (isEggless: ${c.isEggless})`));

        console.log('\nTesting With Egg (false):');
        const resWithEgg = await get(`${baseUrl}?eggless=false`);
        console.log(`Count: ${resWithEgg.cakes.length}`);
        resWithEgg.cakes.forEach(c => console.log(` - ${c.name} (isEggless: ${c.isEggless})`));

    } catch (err) {
        console.error('Error testing API:', err.message);
    }
}

testFilter();
