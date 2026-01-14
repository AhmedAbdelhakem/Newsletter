
export default async function handler(request, response) {
    try {
        const { url } = request.query;

        if (!url) {
            return response.status(400).json({ success: 0, error: 'URL is required' });
        }

        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; NewsletterBot/1.0; +http://localhost:3000)',
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
        }

        const html = await res.text();

        const getMetaTag = (name) => {
            const regex = new RegExp(
                `<meta\\s+(?:name|property)=["'](?:og:)?${name}["']\\s+content=["'](.*?)["']`,
                'i'
            );
            const match = html.match(regex);
            return match ? match[1] : '';
        };

        const title =
            getMetaTag('title') ||
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
            'No title';

        const description = getMetaTag('description');
        const image = getMetaTag('image');

        response.status(200).json({
            success: 1,
            link: url,
            meta: {
                title,
                description,
                image: {
                    url: image,
                },
            },
        });
    } catch (error) {
        console.error('Metadata fetch error:', error.message);
        response.status(500).json({
            success: 0,
            link: request.query.url,
            meta: {},
        });
    }
}
