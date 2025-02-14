# Project Brief
This project is a website which allows users to check if a vanity URL is available on Discord, and also lookup other discord users profile user id and get information about them. We currently already have a fully functional frontend, which I DO NOT, I REPEAT, I DO NOT WANT TO TOUCH! We know need to create the backend for the website. This is going to be deployed on Cloudflare Pages and we are going to be using functions to handle the API requests. I want to use Hono and ZOD to create the backend.

The URLs we are going to be checking from discord are:
Vanity URL: https://discord.com/api/v10/invites/{URLVanityCode}
User Lookup: https://discord.com/api/v10/users/{UserID}

Both of these URLs will return a JSON response, which we will need to parse and return to the frontend. Know our integration with the frontend is from an older backend which I did not like how it was setup, so we are making a new one. 

Additionally we have to pass two headers with each request:
- Authorization: Bot {Discord Bot Token}
- Content-Type: application/json

I also want to support having direct links to the vanity url checker and user lookup. So our URL is discordtest.com/vanity/{URLVanityCode} and discordtest.com/lookup/{UserID}. Will directly link to the user lookup page and the vanity url checker page of requested user or guild.