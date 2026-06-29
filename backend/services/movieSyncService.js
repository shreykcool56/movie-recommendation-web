import { query } from '../db/db.js';

// Curated list of 40 premium movies and webseries (10 of each) to seed when offline or if no API key is specified
const PREMIUM_OFFLINE_MOVIES = [
  // --- Hollywood ---
  {
    id: "premium-hw-1",
    title: "Interstellar",
    type: "movie",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    cast_members: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    synopsis: "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    poster_url: "https://image.tmdb.org/t/p/w500/gEU2Qv4ilfg7ax3Jv1v24B7C0z3.jpg",
    trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7U",
    ratings: 8.7,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "prime", name: "Prime Video", price: 120 },
      { id: "apple", name: "Apple TV+", price: 150 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/xJHok7RjqyOK9m24JjZu7VFBp5m.jpg",
    year: 2014,
    runtime: "169 min",
    languages: ["English", "Hindi"],
    rt_rating: "73%",
    trailer_id: "zSWdZVtXT7U",
    cast_details: [
      { name: "Matthew McConaughey", role: "Cooper", img: "https://image.tmdb.org/t/p/w185/eUiRli4u44Bs2n4U56Egfd48Q1m.jpg" },
      { name: "Anne Hathaway", role: "Brand", img: "https://image.tmdb.org/t/p/w185/4lhbj7hJ14nnSRR4vQt482a45jC.jpg" },
      { name: "Jessica Chastain", role: "Murph", img: "https://image.tmdb.org/t/p/w185/914Qh212vJSDqgOphF4dZ1oG7V0.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-2",
    title: "Inception",
    type: "movie",
    genres: ["Sci-Fi", "Action", "Thriller"],
    cast_members: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    synopsis: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: inception.",
    poster_url: "https://image.tmdb.org/t/p/w500/o0fgcCZdClWg7TyZmA7LIj4nw4R.jpg",
    trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    ratings: 8.8,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "prime", name: "Prime Video", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/8ZuznDM65FU4aa1u2RCnGrz5QDu.jpg",
    year: 2010,
    runtime: "148 min",
    languages: ["English"],
    rt_rating: "87%",
    trailer_id: "YoHD9XEInc0",
    cast_details: [
      { name: "Leonardo DiCaprio", role: "Cobb", img: "https://image.tmdb.org/t/p/w185/wo2hJv0ktj4B2IptJywG446tBc2.jpg" },
      { name: "Joseph Gordon-Levitt", role: "Arthur", img: "https://image.tmdb.org/t/p/w185/dhV95t1nptP6g0asU7u6w24ptwT.jpg" },
      { name: "Elliot Page", role: "Ariadne", img: "https://image.tmdb.org/t/p/w185/tp9w128hA2k5gNpeW69Vrcj2hWv.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-3",
    title: "The Dark Knight",
    type: "movie",
    genres: ["Action", "Drama", "Thriller"],
    cast_members: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    synopsis: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW65GxgYwQI7cWwHmgRxiuOq.jpg",
    trailer_url: "https://www.youtube.com/watch?v=LDG9bisJEaI",
    ratings: 9.0,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "disney", name: "Disney+", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/dqK9Hn2kr2fgZwNd6OUceH0GZAB.jpg",
    year: 2008,
    runtime: "152 min",
    languages: ["English"],
    rt_rating: "94%",
    trailer_id: "LDG9bisJEaI",
    cast_details: [
      { name: "Christian Bale", role: "Bruce Wayne / Batman", img: "https://image.tmdb.org/t/p/w185/b7fTCwq6saTxH6v6qV4nv7wD7ah.jpg" },
      { name: "Heath Ledger", role: "Joker", img: "https://image.tmdb.org/t/p/w185/aa6m1lSFS58nd61vA8959tV4i5n.jpg" },
      { name: "Aaron Eckhart", role: "Harvey Dent", img: "https://image.tmdb.org/t/p/w185/j565J9ipLI852p4G4H2j1nLp267.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-4",
    title: "Dune: Part Two",
    type: "movie",
    genres: ["Sci-Fi", "Adventure", "Action"],
    cast_members: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    synopsis: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_url: "https://image.tmdb.org/t/p/w500/czemZb0V722R89IHnJgKz28bLr6.jpg",
    trailer_url: "https://www.youtube.com/watch?v=Way9Dexny3w",
    ratings: 8.9,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "prime", name: "Prime Video", price: 150 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/xOM0868K6q57wcwJVa4cLftIX4x.jpg",
    year: 2024,
    runtime: "166 min",
    languages: ["English", "Hindi"],
    rt_rating: "95%",
    trailer_id: "Way9Dexny3w",
    cast_details: [
      { name: "Timothée Chalamet", role: "Paul Atreides", img: "https://image.tmdb.org/t/p/w185/BE7ZpS1f9G8v1447H047r6T.jpg" },
      { name: "Zendaya", role: "Chani", img: "https://image.tmdb.org/t/p/w185/7414K68q9vKz941G0fC0T.jpg" },
      { name: "Rebecca Ferguson", role: "Lady Jessica", img: "https://image.tmdb.org/t/p/w185/104e760a7F0Jb1129fC0.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-5",
    title: "Oppenheimer",
    type: "movie",
    genres: ["Drama", "History", "Biography"],
    cast_members: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
    synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    poster_url: "https://image.tmdb.org/t/p/w500/8Gxv2wSbsCxR08krUgEBwbIqjSy.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/nbKzGgYxLwMh3kZex7wTUXxMvT.jpg",
    trailer_url: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    ratings: 8.6,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }, { id: "netflix", name: "Netflix", price: 0 }],
    year: 2023,
    runtime: "180 min",
    languages: ["English"],
    rt_rating: "93%",
    trailer_id: "uYPbbksJxIg",
    cast_details: [
      { name: "Cillian Murphy", role: "J. Robert Oppenheimer", img: "https://image.tmdb.org/t/p/w185/llmZ2k3Dwbw.jpg" },
      { name: "Emily Blunt", role: "Kitty Oppenheimer", img: "https://image.tmdb.org/t/p/w185/EmilyBlunt.jpg" },
      { name: "Matt Damon", role: "Leslie Groves", img: "https://image.tmdb.org/t/p/w185/MattDamon.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-6",
    title: "Avatar",
    type: "movie",
    genres: ["Sci-Fi", "Action", "Adventure"],
    cast_members: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    synopsis: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    poster_url: "https://image.tmdb.org/t/p/w500/kyeqWzo2vO9EXga60Y01m0CebR.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/vL526bAl133J0vh87474413ebS.jpg",
    trailer_url: "https://www.youtube.com/watch?v=5PSNL1q3fcM",
    ratings: 7.9,
    platforms: [{ id: "disney", name: "Disney+", price: 0 }],
    year: 2009,
    runtime: "162 min",
    languages: ["English"],
    rt_rating: "82%",
    trailer_id: "5PSNL1q3fcM",
    cast_details: [
      { name: "Sam Worthington", role: "Jake Sully", img: "https://image.tmdb.org/t/p/w185/SamW.jpg" },
      { name: "Zoe Saldana", role: "Neytiri", img: "https://image.tmdb.org/t/p/w185/ZoeS.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-7",
    title: "Gladiator",
    type: "movie",
    genres: ["Action", "Adventure", "Drama"],
    cast_members: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
    synopsis: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    poster_url: "https://image.tmdb.org/t/p/w500/ty8hDC784fQoVufg47gEK7Esclz.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/wS6XhWn21c60HwPZpx9XGzVUXN9.jpg",
    trailer_url: "https://www.youtube.com/watch?v=P5ieIbInFpg",
    ratings: 8.5,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2000,
    runtime: "155 min",
    languages: ["English"],
    rt_rating: "80%",
    trailer_id: "P5ieIbInFpg",
    cast_details: [
      { name: "Russell Crowe", role: "Maximus", img: "https://image.tmdb.org/t/p/w185/Russell.jpg" },
      { name: "Joaquin Phoenix", role: "Commodus", img: "https://image.tmdb.org/t/p/w185/Joaquin.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-8",
    title: "Titanic",
    type: "movie",
    genres: ["Drama", "Romance"],
    cast_members: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"],
    synopsis: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    poster_url: "https://image.tmdb.org/t/p/w500/9xj7v4rV42ZqN36585g309ES153.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/6ZZ4n65GxgYwQI7cWwHmgRxiuOq.jpg",
    trailer_url: "https://www.youtube.com/watch?v=CHekzSiZ47I",
    ratings: 7.9,
    platforms: [{ id: "disney", name: "Disney+", price: 0 }],
    year: 1997,
    runtime: "194 min",
    languages: ["English"],
    rt_rating: "88%",
    trailer_id: "CHekzSiZ47I",
    cast_details: [
      { name: "Leonardo DiCaprio", role: "Jack Dawson", img: "https://image.tmdb.org/t/p/w185/wo2hJv0ktj4B2IptJywG446tBc2.jpg" },
      { name: "Kate Winslet", role: "Rose DeWitt Bukater", img: "https://image.tmdb.org/t/p/w185/Kate.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-9",
    title: "The Matrix",
    type: "movie",
    genres: ["Sci-Fi", "Action"],
    cast_members: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    synopsis: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    poster_url: "https://image.tmdb.org/t/p/w500/f89U3wzqrjVmq66G2y2uXXn4mZ7.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/l3rhl9XsiPT76M23jV9N2vN6.jpg",
    trailer_url: "https://www.youtube.com/watch?v=m8e-FF8MsqU",
    ratings: 8.7,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 1999,
    runtime: "136 min",
    languages: ["English"],
    rt_rating: "88%",
    trailer_id: "m8e-FF8MsqU",
    cast_details: [
      { name: "Keanu Reeves", role: "Neo", img: "https://image.tmdb.org/t/p/w185/Keanu.jpg" },
      { name: "Laurence Fishburne", role: "Morpheus", img: "https://image.tmdb.org/t/p/w185/Laurence.jpg" }
    ],
    industry: "hollywood"
  },
  {
    id: "premium-hw-10",
    title: "Avengers: Endgame",
    type: "movie",
    genres: ["Action", "Sci-Fi", "Adventure"],
    cast_members: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
    synopsis: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
    poster_url: "https://image.tmdb.org/t/p/w500/or06509kZk2u3u51Z534n8.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/7RyGuZ2dYg4b2y4g67U7u6w.jpg",
    trailer_url: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    ratings: 8.4,
    platforms: [{ id: "disney", name: "Disney+", price: 0 }],
    year: 2019,
    runtime: "181 min",
    languages: ["English"],
    rt_rating: "94%",
    trailer_id: "TcMBFSGVi1c",
    cast_details: [
      { name: "Robert Downey Jr.", role: "Tony Stark / Iron Man", img: "https://image.tmdb.org/t/p/w185/Robert.jpg" },
      { name: "Chris Evans", role: "Steve Rogers / Captain America", img: "https://image.tmdb.org/t/p/w185/Chris.jpg" }
    ],
    industry: "hollywood"
  },

  // --- Bollywood ---
  {
    id: "premium-bw-1",
    title: "3 Idiots",
    type: "movie",
    genres: ["Comedy", "Drama"],
    cast_members: ["Aamir Khan", "R. Madhavan", "Sharman Joshi"],
    synopsis: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them 'idiots'.",
    poster_url: "https://image.tmdb.org/t/p/w500/66474413ebS9xj7v4rV42ZqN365.jpg",
    trailer_url: "https://www.youtube.com/watch?v=K0eDlFX9GMc",
    ratings: 8.4,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "prime", name: "Prime Video", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/u2cA36Z5y50Dwb64V76R0ge54.jpg",
    year: 2009,
    runtime: "170 min",
    languages: ["Hindi", "English"],
    rt_rating: "90%",
    trailer_id: "K0eDlFX9GMc",
    cast_details: [
      { name: "Aamir Khan", role: "Rancho", img: "https://image.tmdb.org/t/p/w185/5Lg50D270Q.jpg" },
      { name: "R. Madhavan", role: "Farhan Qureshi", img: "https://image.tmdb.org/t/p/w185/Madhavan.jpg" },
      { name: "Sharman Joshi", role: "Raju Rastogi", img: "https://image.tmdb.org/t/p/w185/Sharman.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-2",
    title: "Dangal",
    type: "movie",
    genres: ["Drama", "Biography", "Action"],
    cast_members: ["Aamir Khan", "Sakshi Tanwar", "Fatima Sana Shaikh"],
    synopsis: "Mahavir Singh Phogat, a former wrestler, decides to fulfill his dream of winning a gold medal for his country by training his daughters Geeta and Babita to become world-class wrestlers.",
    poster_url: "https://image.tmdb.org/t/p/w500/7456DdaYQh0Z6jL3R6qnEu8H1w.jpg",
    trailer_url: "https://www.youtube.com/watch?v=x_7YlGv9u1g",
    ratings: 8.4,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/70ge54u2cA36Z5y50Dwb64V76R0.jpg",
    year: 2016,
    runtime: "161 min",
    languages: ["Hindi"],
    rt_rating: "88%",
    trailer_id: "x_7YlGv9u1g",
    cast_details: [
      { name: "Aamir Khan", role: "Mahavir Singh Phogat", img: "https://image.tmdb.org/t/p/w185/5Lg50D270Q.jpg" },
      { name: "Sakshi Tanwar", role: "Daya Shobha Kaur", img: "https://image.tmdb.org/t/p/w185/Sakshi.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-3",
    title: "Sholay",
    type: "movie",
    genres: ["Action", "Adventure", "Comedy"],
    cast_members: ["Dharmendra", "Sanjeev Kumar", "Hema Malini"],
    synopsis: "After his family is murdered by a notorious bandit named Gabbar Singh, a retired police officer recruits two small-time convicts to capture him.",
    poster_url: "https://image.tmdb.org/t/p/w500/2vO9EXga60Y01m0CebRkyeQWzo.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/wVufg47gEK7Esclzty8hDC784f.jpg",
    trailer_url: "https://www.youtube.com/watch?v=de_5k_BvOsk",
    ratings: 8.2,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 1975,
    runtime: "204 min",
    languages: ["Hindi"],
    rt_rating: "92%",
    trailer_id: "de_5k_BvOsk",
    cast_details: [
      { name: "Dharmendra", role: "Veeru", img: "https://image.tmdb.org/t/p/w185/Dharmendra.jpg" },
      { name: "Amitabh Bachchan", role: "Jai", img: "https://image.tmdb.org/t/p/w185/Amitabh.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-4",
    title: "Jawan",
    type: "movie",
    genres: ["Action", "Thriller"],
    cast_members: ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"],
    synopsis: "A personal grudge drives a man to settle scores with a ruthless arms dealer, while attempting to correct the wrongs of society and fulfill a promise made years ago.",
    poster_url: "https://image.tmdb.org/t/p/w500/1s85g309ES1539xj7v4rV42ZqN3.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/lPT76M23jV9N2vN6l3rhl9XsiPT.jpg",
    trailer_url: "https://www.youtube.com/watch?v=COv527TEy64",
    ratings: 7.8,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2023,
    runtime: "168 min",
    languages: ["Hindi", "Tamil", "Telugu"],
    rt_rating: "85%",
    trailer_id: "COv527TEy64",
    cast_details: [
      { name: "Shah Rukh Khan", role: "Vikram Rathore / Azad", img: "https://image.tmdb.org/t/p/w185/SRK.jpg" },
      { name: "Nayanthara", role: "Narmada Rai", img: "https://image.tmdb.org/t/p/w185/Nayanthara.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-5",
    title: "Zindagi Na Milegi Dobara",
    type: "movie",
    genres: ["Comedy", "Drama", "Romance"],
    cast_members: ["Hrithik Roshan", "Farhan Akhtar", "Abhay Deol"],
    synopsis: "Three friends decide to turn their fantasy bachelor road trip in Spain into reality after one of them gets engaged.",
    poster_url: "https://image.tmdb.org/t/p/w500/y94nv7wD7ahb7fTCwq6saTxH6v.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/aa8959tV4i5naa6m1lSFS58nd61.jpg",
    trailer_url: "https://www.youtube.com/watch?v=NX7N1w26Z8E",
    ratings: 8.2,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2011,
    runtime: "155 min",
    languages: ["Hindi"],
    rt_rating: "91%",
    trailer_id: "NX7N1w26Z8E",
    cast_details: [
      { name: "Hrithik Roshan", role: "Arjun", img: "https://image.tmdb.org/t/p/w185/Hrithik.jpg" },
      { name: "Farhan Akhtar", role: "Imran", img: "https://image.tmdb.org/t/p/w185/Farhan.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-6",
    title: "Dilwale Dulhania Le Jayenge",
    type: "movie",
    genres: ["Drama", "Romance", "Comedy"],
    cast_members: ["Shah Rukh Khan", "Kajol", "Amrish Puri"],
    synopsis: "Raj and Simran meet on a trip through Europe. Simran falls in love with him but her conservative father has already promised her hand to another in India.",
    poster_url: "https://image.tmdb.org/t/p/w500/uC6TTpg4tU75Y07CVS1THe71Sl.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/81szTId4g9V035w3UaZ6lE1X7n0.jpg",
    trailer_url: "https://www.youtube.com/watch?v=c25GKl5VNeY",
    ratings: 8.3,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 1995,
    runtime: "189 min",
    languages: ["Hindi"],
    rt_rating: "93%",
    trailer_id: "c25GKl5VNeY",
    cast_details: [
      { name: "Shah Rukh Khan", role: "Raj Malhotra", img: "https://image.tmdb.org/t/p/w185/SRK.jpg" },
      { name: "Kajol", role: "Simran Singh", img: "https://image.tmdb.org/t/p/w185/Kajol.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-7",
    title: "Gangs of Wasseypur",
    type: "movie",
    genres: ["Action", "Crime", "Drama"],
    cast_members: ["Manoj Bajpayee", "Nawazuddin Siddiqui", "Richa Chadha"],
    synopsis: "A clash between Sultan and Shahid Khan leads to the expulsion of Shahid Khan from Wasseypur, igniting a deadly multi-generational coal mafia feud.",
    poster_url: "https://image.tmdb.org/t/p/w500/j52p4G4H2j1nLp26765J9ipLI85.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/b7TCwq6saTxH6v6qV4nv7wD7ah.jpg",
    trailer_url: "https://www.youtube.com/watch?v=j-AkWDkXcMY",
    ratings: 8.2,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2012,
    runtime: "321 min",
    languages: ["Hindi"],
    rt_rating: "96%",
    trailer_id: "j-AkWDkXcMY",
    cast_details: [
      { name: "Manoj Bajpayee", role: "Sardar Khan", img: "https://image.tmdb.org/t/p/w185/Manoj.jpg" },
      { name: "Nawazuddin Siddiqui", role: "Faizal Khan", img: "https://image.tmdb.org/t/p/w185/Nawaz.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-8",
    title: "Pathaan",
    type: "movie",
    genres: ["Action", "Thriller"],
    cast_members: ["Shah Rukh Khan", "Deepika Padukone", "John Abraham"],
    synopsis: "An Indian agent comes out of exile to stop a rogue military group planning to launch a bio-weapon attack on India.",
    poster_url: "https://image.tmdb.org/t/p/w500/i9l0U.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/lksd8.jpg",
    trailer_url: "https://www.youtube.com/watch?v=vqu4z34wEN8",
    ratings: 7.0,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 2023,
    runtime: "146 min",
    languages: ["Hindi"],
    rt_rating: "82%",
    trailer_id: "vqu4z34wEN8",
    cast_details: [
      { name: "Shah Rukh Khan", role: "Pathaan", img: "https://image.tmdb.org/t/p/w185/SRK.jpg" },
      { name: "Deepika Padukone", role: "Rubina Mohsin", img: "https://image.tmdb.org/t/p/w185/Deepika.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-9",
    title: "Bajrangi Bhaijaan",
    type: "movie",
    genres: ["Comedy", "Drama", "Action"],
    cast_members: ["Salman Khan", "Harshaali Malhotra", "Kareena Kapoor"],
    synopsis: "A warm-hearted Indian man takes a young mute Pakistani girl back to her homeland to reunite her with her family.",
    poster_url: "https://image.tmdb.org/t/p/w500/bajrangi.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/bajrangiback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=4nwArEscLfk",
    ratings: 8.1,
    platforms: [{ id: "hotstar", name: "Disney+ Hotstar", price: 0 }],
    year: 2015,
    runtime: "163 min",
    languages: ["Hindi"],
    rt_rating: "100%",
    trailer_id: "4nwArEscLfk",
    cast_details: [
      { name: "Salman Khan", role: "Pawan Kumar Chaturvedi", img: "https://image.tmdb.org/t/p/w185/Salman.jpg" },
      { name: "Harshaali Malhotra", role: "Shahida / Munni", img: "https://image.tmdb.org/t/p/w185/Harshaali.jpg" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-10",
    title: "Barfi!",
    type: "movie",
    genres: ["Comedy", "Drama", "Romance"],
    cast_members: ["Ranbir Kapoor", "Priyanka Chopra", "Ileana D'Cruz"],
    synopsis: "Three young people learn that love can neither be defined nor contained by society's definition of normal and abnormal.",
    poster_url: "https://image.tmdb.org/t/p/w500/barfi.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/barfiback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=yZHEN3mDBh0",
    ratings: 8.1,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2012,
    runtime: "151 min",
    languages: ["Hindi"],
    rt_rating: "92%",
    trailer_id: "yZHEN3mDBh0",
    cast_details: [
      { name: "Ranbir Kapoor", role: "Murphy 'Barfi' Bahadur", img: "https://image.tmdb.org/t/p/w185/Ranbir.jpg" },
      { name: "Priyanka Chopra", role: "Jhilmil Chatterjee", img: "https://image.tmdb.org/t/p/w185/Priyanka.jpg" }
    ],
    industry: "bollywood"
  },

  // --- Tollywood ---
  {
    id: "premium-tw-1",
    title: "Baahubali: The Beginning",
    type: "movie",
    genres: ["Action", "Drama", "Fantasy"],
    cast_members: ["Prabhas", "Rana Daggubati", "Anushka Shetty"],
    synopsis: "In ancient Kingdom of Mahishmati, a child is raised by commoners and grows up to be a strong man, discovering his noble lineage and preparing to confront a tyrannical king.",
    poster_url: "https://image.tmdb.org/t/p/w500/z45HiuN4r764bwhqH6Pj466L61C.jpg",
    trailer_url: "https://www.youtube.com/watch?v=sOEg_YZQsTI",
    ratings: 8.0,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "hotstar", name: "Disney+ Hotstar", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/t558nCxQv74JTY1I1ExuYq5J2Gi.jpg",
    year: 2015,
    runtime: "159 min",
    languages: ["Telugu", "Tamil", "Hindi"],
    rt_rating: "87%",
    trailer_id: "sOEg_YZQsTI",
    cast_details: [
      { name: "Prabhas", role: "Shivudu / Baahubali", img: "https://image.tmdb.org/t/p/w185/Prabhas.jpg" },
      { name: "Rana Daggubati", role: "Bhallaladeva", img: "https://image.tmdb.org/t/p/w185/Rana.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-2",
    title: "RRR",
    type: "movie",
    genres: ["Action", "Drama"],
    cast_members: ["N.T. Rama Rao Jr.", "Ram Charan", "Alia Bhatt"],
    synopsis: "A fictional history of two legendary revolutionaries' journey away from home before they began fighting for their country in the 1920s.",
    poster_url: "https://image.tmdb.org/t/p/w500/nEu8H1w73456DdaYQh0Z6jL3R6q.jpg",
    trailer_url: "https://www.youtube.com/watch?v=NgBoMJy386M",
    ratings: 8.0,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 },
      { id: "zee5", name: "ZEE5", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/70ge54u2cA36Z5y50Dwb64V76R0.jpg",
    year: 2022,
    runtime: "187 min",
    languages: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    rt_rating: "95%",
    trailer_id: "NgBoMJy386M",
    cast_details: [
      { name: "N.T. Rama Rao Jr.", role: "Komaram Bheem", img: "https://image.tmdb.org/t/p/w185/NTR.jpg" },
      { name: "Ram Charan", role: "Alluri Sitarama Raju", img: "https://image.tmdb.org/t/p/w185/RamCharan.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-3",
    title: "Pushpa: The Rise",
    type: "movie",
    genres: ["Action", "Crime", "Drama"],
    cast_members: ["Allu Arjun", "Fahadh Faasil", "Rashmika Mandanna"],
    synopsis: "Violence erupts between red sandalwood smugglers and the police in the Seshachalam forests of Andhra Pradesh, as coolie Pushpa Raj rises to rule the syndicate.",
    poster_url: "https://image.tmdb.org/t/p/w500/pushpa.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/pushpaback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=pKctjlxbFDQ",
    ratings: 7.6,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 2021,
    runtime: "179 min",
    languages: ["Telugu", "Hindi", "Tamil"],
    rt_rating: "80%",
    trailer_id: "pKctjlxbFDQ",
    cast_details: [
      { name: "Allu Arjun", role: "Pushpa Raj", img: "https://image.tmdb.org/t/p/w185/AlluArjun.jpg" },
      { name: "Fahadh Faasil", role: "Bhanwar Singh Shekhawat", img: "https://image.tmdb.org/t/p/w185/Fahadh.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-4",
    title: "Kalki 2898 AD",
    type: "movie",
    genres: ["Sci-Fi", "Action", "Adventure"],
    cast_members: ["Prabhas", "Amitabh Bachchan", "Kamal Haasan"],
    synopsis: "A modern avatar of Vishnu, a Hindu god, is believed to have descended to Earth to protect the world from evil forces in a futuristic setting.",
    poster_url: "https://image.tmdb.org/t/p/w500/kalki.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/kalkiback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=L3oOldViMxY",
    ratings: 7.7,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }, { id: "prime", name: "Prime Video", price: 0 }],
    year: 2024,
    runtime: "180 min",
    languages: ["Telugu", "Hindi", "Tamil"],
    rt_rating: "85%",
    trailer_id: "L3oOldViMxY",
    cast_details: [
      { name: "Prabhas", role: "Bhairava", img: "https://image.tmdb.org/t/p/w185/Prabhas.jpg" },
      { name: "Amitabh Bachchan", role: "Ashwatthama", img: "https://image.tmdb.org/t/p/w185/Amitabh.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-5",
    title: "Salaar: Ceasefire",
    type: "movie",
    genres: ["Action", "Thriller"],
    cast_members: ["Prabhas", "Prithviraj Sukumaran", "Shruti Haasan"],
    synopsis: "A gang leader makes a promise to a dying friend and takes on other criminal gangs.",
    poster_url: "https://image.tmdb.org/t/p/w500/salaar.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/salaarback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=4GPvYV_Z4L8",
    ratings: 6.9,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2023,
    runtime: "175 min",
    languages: ["Telugu", "Hindi", "Kannada"],
    rt_rating: "70%",
    trailer_id: "4GPvYV_Z4L8",
    cast_details: [
      { name: "Prabhas", role: "Deva / Salaar", img: "https://image.tmdb.org/t/p/w185/Prabhas.jpg" },
      { name: "Prithviraj Sukumaran", role: "Varadharaja Mannaar", img: "https://image.tmdb.org/t/p/w185/Prithviraj.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-6",
    title: "Magadheera",
    type: "movie",
    genres: ["Action", "Drama", "Fantasy"],
    cast_members: ["Ram Charan", "Kajal Aggarwal", "Dev Gill"],
    synopsis: "A bike stuntman recalls his previous life as a warrior in 17th century Rajasthan, trying to save his princess and defeat a corrupt military commander.",
    poster_url: "https://image.tmdb.org/t/p/w500/magadheera.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/magadheeraback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=wGZ82rV8e4A",
    ratings: 7.7,
    platforms: [{ id: "hotstar", name: "Disney+ Hotstar", price: 0 }],
    year: 2009,
    runtime: "166 min",
    languages: ["Telugu"],
    rt_rating: "83%",
    trailer_id: "wGZ82rV8e4A",
    cast_details: [
      { name: "Ram Charan", role: "Kala Bhairava / Harsha", img: "https://image.tmdb.org/t/p/w185/RamCharan.jpg" },
      { name: "Kajal Aggarwal", role: "Mithravinda Devi / Indu", img: "https://image.tmdb.org/t/p/w185/Kajal.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-7",
    title: "Arjun Reddy",
    type: "movie",
    genres: ["Drama", "Romance"],
    cast_members: ["Vijay Deverakonda", "Shalini Pandey", "Jia Sharma"],
    synopsis: "Arjun Reddy, a short-tempered house surgeon, gets habituated to drugs and alcohol when his girlfriend is forced to marry another person.",
    poster_url: "https://image.tmdb.org/t/p/w500/arjunreddy.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/arjunreddyback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=aozWq_W-D8M",
    ratings: 8.0,
    platforms: [{ id: "hotstar", name: "Disney+ Hotstar", price: 0 }],
    year: 2017,
    runtime: "182 min",
    languages: ["Telugu"],
    rt_rating: "85%",
    trailer_id: "aozWq_W-D8M",
    cast_details: [
      { name: "Vijay Deverakonda", role: "Dr. Arjun Reddy Deshmukh", img: "https://image.tmdb.org/t/p/w185/Vijay.jpg" },
      { name: "Shalini Pandey", role: "Preethi Shetty", img: "https://image.tmdb.org/t/p/w185/Shalini.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-8",
    title: "Jersey",
    type: "movie",
    genres: ["Drama", "Sport"],
    cast_members: ["Nani", "Shraddha Srinath", "Ronit Kamra"],
    synopsis: "A failed cricketer decides to revive his career in his late thirties, driven by the desire to fulfill his son's wish for a jersey as a gift.",
    poster_url: "https://image.tmdb.org/t/p/w500/jersey.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/jerseyback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=R4vEupFEtkY",
    ratings: 8.5,
    platforms: [{ id: "hotstar", name: "Disney+ Hotstar", price: 0 }],
    year: 2019,
    runtime: "140 min",
    languages: ["Telugu"],
    rt_rating: "96%",
    trailer_id: "R4vEupFEtkY",
    cast_details: [
      { name: "Nani", role: "Arjun", img: "https://image.tmdb.org/t/p/w185/Nani.jpg" },
      { name: "Shraddha Srinath", role: "Sarah", img: "https://image.tmdb.org/t/p/w185/Shraddha.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-9",
    title: "Devara: Part 1",
    type: "movie",
    genres: ["Action", "Drama", "Thriller"],
    cast_members: ["N.T. Rama Rao Jr.", "Saif Ali Khan", "Janhvi Kapoor"],
    synopsis: "An epic action saga set in coastal lands, chronicling dynamic characters and battles against dark smuggling networks.",
    poster_url: "https://image.tmdb.org/t/p/w500/devara.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/devaraback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=aG-Qc4G1B1g",
    ratings: 7.2,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2024,
    runtime: "177 min",
    languages: ["Telugu", "Hindi", "Tamil"],
    rt_rating: "78%",
    trailer_id: "aG-Qc4G1B1g",
    cast_details: [
      { name: "N.T. Rama Rao Jr.", role: "Devara / Vara", img: "https://image.tmdb.org/t/p/w185/NTR.jpg" },
      { name: "Saif Ali Khan", role: "Bhaira", img: "https://image.tmdb.org/t/p/w185/Saif.jpg" }
    ],
    industry: "tollywood"
  },
  {
    id: "premium-tw-10",
    title: "Eega",
    type: "movie",
    genres: ["Action", "Comedy", "Fantasy"],
    cast_members: ["Sudeep", "Nani", "Samantha Ruth Prabhu"],
    synopsis: "A murdered man is reincarnated as a housefly and seeks to avenge his death and protect his love from the villain who killed him.",
    poster_url: "https://image.tmdb.org/t/p/w500/eega.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/eegaback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=3lR_N3k4xYk",
    ratings: 7.7,
    platforms: [{ id: "hotstar", name: "Disney+ Hotstar", price: 0 }],
    year: 2012,
    runtime: "145 min",
    languages: ["Telugu", "Tamil", "Hindi"],
    rt_rating: "85%",
    trailer_id: "3lR_N3k4xYk",
    cast_details: [
      { name: "Sudeep", role: "Sudeep", img: "https://image.tmdb.org/t/p/w185/Sudeep.jpg" },
      { name: "Nani", role: "Nani", img: "https://image.tmdb.org/t/p/w185/Nani.jpg" }
    ],
    industry: "tollywood"
  },

  // --- Webseries ---
  {
    id: "premium-ws-1",
    title: "Stranger Things",
    type: "series",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    cast_members: ["Millie Bobby Brown", "Winona Ryder", "David Harbour"],
    synopsis: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_url: "https://image.tmdb.org/t/p/w500/x2Lw3ku51Z534nor06509kZk2u3.jpg",
    trailer_url: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    ratings: 8.7,
    platforms: [
      { id: "netflix", name: "Netflix", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/56v2Kj2q2zsOVj3tX7zGwtmY8f6.jpg",
    year: 2016,
    runtime: "4 Seasons",
    languages: ["English", "Hindi"],
    rt_rating: "92%",
    trailer_id: "b9EkMc79ZSU",
    cast_details: [
      { name: "Millie Bobby Brown", role: "Eleven", img: "https://image.tmdb.org/t/p/w185/Millie.jpg" },
      { name: "Winona Ryder", role: "Joyce Byers", img: "https://image.tmdb.org/t/p/w185/Winona.jpg" },
      { name: "David Harbour", role: "Jim Hopper", img: "https://image.tmdb.org/t/p/w185/David.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-2",
    title: "Game of Thrones",
    type: "series",
    genres: ["Action", "Adventure", "Drama"],
    cast_members: ["Emilia Clarke", "Kit Harington", "Peter Dinklage"],
    synopsis: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.",
    poster_url: "https://image.tmdb.org/t/p/w500/1XS1nmaHZcZ24scJU4BgLIuEQcV.jpg",
    trailer_url: "https://www.youtube.com/watch?v=gcTkFNGeTSc",
    ratings: 9.2,
    platforms: [
      { id: "hotstar", name: "Disney+ Hotstar", price: 0 }
    ],
    backdrop_url: "https://image.tmdb.org/t/p/w1280/2OMB0hk21iZsVI6kg85t8u88BoI.jpg",
    year: 2011,
    runtime: "8 Seasons",
    languages: ["English"],
    rt_rating: "89%",
    trailer_id: "gcTkFNGeTSc",
    cast_details: [
      { name: "Emilia Clarke", role: "Daenerys Targaryen", img: "https://image.tmdb.org/t/p/w185/Emilia.jpg" },
      { name: "Kit Harington", role: "Jon Snow", img: "https://image.tmdb.org/t/p/w185/Kit.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-3",
    title: "Sacred Games",
    type: "series",
    genres: ["Action", "Crime", "Thriller"],
    cast_members: ["Saif Ali Khan", "Nawazuddin Siddiqui", "Radhika Apte"],
    synopsis: "A link in their pasts leads an honest cop to a fugitive gang boss, whose cryptic warning spurs the officer on a quest to save Mumbai from cataclysm.",
    poster_url: "https://image.tmdb.org/t/p/w500/775H7xI2U8G4m8h3B58J864wR2B.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/gamesback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=28j8h0XRqQs",
    ratings: 8.5,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2018,
    runtime: "2 Seasons",
    languages: ["Hindi"],
    rt_rating: "76%",
    trailer_id: "28j8h0XRqQs",
    cast_details: [
      { name: "Saif Ali Khan", role: "Sartaj Singh", img: "https://image.tmdb.org/t/p/w185/Saif.jpg" },
      { name: "Nawazuddin Siddiqui", role: "Ganesh Gaitonde", img: "https://image.tmdb.org/t/p/w185/Nawaz.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-4",
    title: "The Family Man",
    type: "series",
    genres: ["Action", "Comedy", "Drama"],
    cast_members: ["Manoj Bajpayee", "Priyamani", "Sharib Hashmi"],
    synopsis: "A middle-class man secretly works as an intelligence officer for the Threat Analysis and Surveillance Cell, trying to protect the nation while keeping his family safe.",
    poster_url: "https://image.tmdb.org/t/p/w500/familyman.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/familymanback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=XatRGut65VI",
    ratings: 8.7,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 2019,
    runtime: "2 Seasons",
    languages: ["Hindi", "English"],
    rt_rating: "95%",
    trailer_id: "XatRGut65VI",
    cast_details: [
      { name: "Manoj Bajpayee", role: "Srikant Tiwari", img: "https://image.tmdb.org/t/p/w185/Manoj.jpg" },
      { name: "Sharib Hashmi", role: "JK Talpade", img: "https://image.tmdb.org/t/p/w185/Sharib.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-5",
    title: "Mirzapur",
    type: "series",
    genres: ["Action", "Crime", "Drama"],
    cast_members: ["Pankaj Tripathi", "Ali Fazal", "Divyendu Sharma"],
    synopsis: "A shocking incident at a wedding procession ignites a series of events, entangling the lives of two families in the lawless city of Mirzapur.",
    poster_url: "https://image.tmdb.org/t/p/w500/mirzapur.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/mirzapurback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=ZNeGFyY14UI",
    ratings: 8.5,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 2018,
    runtime: "3 Seasons",
    languages: ["Hindi"],
    rt_rating: "85%",
    trailer_id: "ZNeGFyY14UI",
    cast_details: [
      { name: "Pankaj Tripathi", role: "Akhandanand 'Kaleen Bhaiya' Tripathi", img: "https://image.tmdb.org/t/p/w185/Pankaj.jpg" },
      { name: "Ali Fazal", role: "Govind 'Guddu' Pandit", img: "https://image.tmdb.org/t/p/w185/Ali.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-6",
    title: "Panchayat",
    type: "series",
    genres: ["Comedy", "Drama"],
    cast_members: ["Jitendra Kumar", "Raghubir Yadav", "Neena Gupta"],
    synopsis: "An engineering graduate takes up a job as a secretary of a Panchayat office in a remote village named Phulera, due to a lack of better job options.",
    poster_url: "https://image.tmdb.org/t/p/w500/panchayat.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/panchayatback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=mCpeVkiZf5E",
    ratings: 8.9,
    platforms: [{ id: "prime", name: "Prime Video", price: 0 }],
    year: 2020,
    runtime: "3 Seasons",
    languages: ["Hindi"],
    rt_rating: "96%",
    trailer_id: "mCpeVkiZf5E",
    cast_details: [
      { name: "Jitendra Kumar", role: "Abhishek Tripathi", img: "https://image.tmdb.org/t/p/w185/Jitendra.jpg" },
      { name: "Raghubir Yadav", role: "Brij Bhushan Dubey", img: "https://image.tmdb.org/t/p/w185/Raghubir.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-7",
    title: "Breaking Bad",
    type: "series",
    genres: ["Crime", "Drama", "Thriller"],
    cast_members: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    synopsis: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
    poster_url: "https://image.tmdb.org/t/p/w500/ztkUQj611sR75ASj2j96mu45865.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/ts58nCxQv74JTY1I1ExuYq5J2Gi.jpg",
    trailer_url: "https://www.youtube.com/watch?v=HhesaQXLuRY",
    ratings: 9.5,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2008,
    runtime: "5 Seasons",
    languages: ["English"],
    rt_rating: "96%",
    trailer_id: "HhesaQXLuRY",
    cast_details: [
      { name: "Bryan Cranston", role: "Walter White", img: "https://image.tmdb.org/t/p/w185/Bryan.jpg" },
      { name: "Aaron Paul", role: "Jesse Pinkman", img: "https://image.tmdb.org/t/p/w185/Aaron.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-8",
    title: "Money Heist",
    type: "series",
    genres: ["Action", "Crime", "Mystery"],
    cast_members: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño"],
    synopsis: "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.",
    poster_url: "https://image.tmdb.org/t/p/w500/reKs8aH0VRM6s9xj7v4rV4.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/moneyback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=_InqQJRqGW4",
    ratings: 8.2,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2017,
    runtime: "5 Parts",
    languages: ["Spanish", "English", "Hindi"],
    rt_rating: "90%",
    trailer_id: "_InqQJRqGW4",
    cast_details: [
      { name: "Úrsula Corberó", role: "Tokyo", img: "https://image.tmdb.org/t/p/w185/Ursula.jpg" },
      { name: "Álvaro Morte", role: "The Professor", img: "https://image.tmdb.org/t/p/w185/Alvaro.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-9",
    title: "Asur: Welcome to Your Dark Side",
    type: "series",
    genres: ["Crime", "Mystery", "Thriller"],
    cast_members: ["Arshad Warsi", "Barun Sobti", "Anupriya Goenka"],
    synopsis: "A unique psychological thriller that pits forensic science against the mysticism of Indian mythology, amidst a series of bizarre murders.",
    poster_url: "https://image.tmdb.org/t/p/w500/asur.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/asurback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=LdKpe19X1y4",
    ratings: 8.4,
    platforms: [{ id: "jio", name: "JioCinema", price: 0 }],
    year: 2020,
    runtime: "2 Seasons",
    languages: ["Hindi"],
    rt_rating: "88%",
    trailer_id: "LdKpe19X1y4",
    cast_details: [
      { name: "Arshad Warsi", role: "Dhananjay Rajput", img: "https://image.tmdb.org/t/p/w185/Arshad.jpg" },
      { name: "Barun Sobti", role: "Nikhil Nair", img: "https://image.tmdb.org/t/p/w185/Barun.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-ws-10",
    title: "Scam 1992",
    type: "series",
    genres: ["Drama", "Biography", "Crime"],
    cast_members: ["Pratik Gandhi", "Shreya Dhanwanthary", "Hemant Kher"],
    synopsis: "Set in 1980s & 90s Bombay, Scam 1992 follows the life of Harshad Mehta, a stockbroker who took the stock market to dizzying heights & his catastrophic downfall.",
    poster_url: "https://image.tmdb.org/t/p/w500/scam1992.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/scamback.jpg",
    trailer_url: "https://www.youtube.com/watch?v=2gb9Hj5947M",
    ratings: 9.3,
    platforms: [{ id: "sony", name: "SonyLIV", price: 0 }],
    year: 2020,
    runtime: "10 Episodes",
    languages: ["Hindi", "English"],
    rt_rating: "97%",
    trailer_id: "2gb9Hj5947M",
    cast_details: [
      { name: "Pratik Gandhi", role: "Harshad Mehta", img: "https://image.tmdb.org/t/p/w185/Pratik.jpg" },
      { name: "Shreya Dhanwanthary", role: "Sucheta Dalal", img: "https://image.tmdb.org/t/p/w185/Shreya.jpg" }
    ],
    industry: "webseries"
  },
  {
    id: "premium-bw-11",
    title: "Stree 2",
    type: "movie",
    genres: ["Comedy", "Horror", "Mystery"],
    cast_members: ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi"],
    synopsis: "In the town of Chanderi, a new headless ghost named 'Sarkata' starts abducting women. The townsfolk must once again rely on Vicky and the mysterious Stree to save them.",
    poster_url: "https://image.tmdb.org/t/p/w500/z0T0mQ8s0eFzN1H5S7n1C6H.jpg",
    backdrop_url: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1200",
    trailer_url: "https://www.youtube.com/watch?v=x9_hD3Z3j04",
    ratings: 8.0,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2024,
    runtime: "147 min",
    languages: ["Hindi"],
    rt_rating: "82%",
    trailer_id: "x9_hD3Z3j04",
    cast_details: [
      { name: "Rajkummar Rao", role: "Vicky", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
      { name: "Shraddha Kapoor", role: "Stree", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-12",
    title: "Animal",
    type: "movie",
    genres: ["Action", "Drama", "Crime"],
    cast_members: ["Ranbir Kapoor", "Anil Kapoor", "Bobby Deol"],
    synopsis: "The complex relationship between a father and son is set against the backdrop of a violent underworld war, driving the son to extreme vengeance.",
    poster_url: "https://image.tmdb.org/t/p/w500/x2Lw3ku51Z534.jpg",
    backdrop_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200",
    trailer_url: "https://www.youtube.com/watch?v=8FkLRUJj-C0",
    ratings: 6.8,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2023,
    runtime: "201 min",
    languages: ["Hindi", "Telugu"],
    rt_rating: "30%",
    trailer_id: "8FkLRUJj-C0",
    cast_details: [
      { name: "Ranbir Kapoor", role: "Ranvijay Singh", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { name: "Anil Kapoor", role: "Balbir Singh", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-bw-13",
    title: "Laapataa Ladies",
    type: "movie",
    genres: ["Comedy", "Drama"],
    cast_members: ["Sparsh Shrivastava", "Pratibha Ranta", "Nitanshi Goel"],
    synopsis: "The misadventures of two young brides who get accidentally swapped on a train journey, leading to a heartwarming search in rural India.",
    poster_url: "https://image.tmdb.org/t/p/w500/laapataa.jpg",
    backdrop_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200",
    trailer_url: "https://www.youtube.com/watch?v=CoM3E8K4J4w",
    ratings: 8.5,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2024,
    runtime: "122 min",
    languages: ["Hindi"],
    rt_rating: "100%",
    trailer_id: "CoM3E8K4J4w",
    cast_details: [
      { name: "Sparsh Shrivastava", role: "Deepak", img: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=100" },
      { name: "Pratibha Ranta", role: "Jaya", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100" }
    ],
    industry: "bollywood"
  },
  {
    id: "premium-ws-11",
    title: "Kota Factory",
    type: "series",
    genres: ["Drama", "Comedy"],
    cast_members: ["Jitendra Kumar", "Mayur More", "Ranjan Raj"],
    synopsis: "Set in Kota, Rajasthan, a major coaching hub for IIT-JEE aspirants, this show explores the lives and struggles of student Vaibhav and his friends under the guidance of Jeetu Bhaiya.",
    poster_url: "https://image.tmdb.org/t/p/w500/kotafactory.jpg",
    backdrop_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200",
    trailer_url: "https://www.youtube.com/watch?v=pnp_9ZzV8zI",
    ratings: 9.0,
    platforms: [{ id: "netflix", name: "Netflix", price: 0 }],
    year: 2019,
    runtime: "3 Seasons",
    languages: ["Hindi"],
    rt_rating: "92%",
    trailer_id: "pnp_9ZzV8zI",
    cast_details: [
      { name: "Jitendra Kumar", role: "Jeetu Bhaiya", img: "https://image.tmdb.org/t/p/w185/Jitendra.jpg" },
      { name: "Mayur More", role: "Vaibhav Pandey", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" }
    ],
    industry: "webseries"
  }
];

const TMDB_GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

let isSyncRunning = false;
let shouldStopSync = false;

export function interruptRunningSync() {
  if (isSyncRunning) {
    shouldStopSync = true;
    console.log('🛑 Request received to interrupt current movie sync.');
  }
}

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch details from TMDB API
async function fetchFromTmdb(endpoint, apiKey, params = {}) {
  const urlParams = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  const url = `https://api.themoviedb.org/3${endpoint}?${urlParams}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API call failed: ${response.statusText} (${response.status})`);
  }
  return response.json();
}

export async function runMovieSync() {
  if (isSyncRunning) {
    console.warn('⚠️ A sync is already in progress.');
    return;
  }

  isSyncRunning = true;
  shouldStopSync = false;

  console.log('🚀 Initializing CineVerse Movie Sync...');

  try {
    // 1. Fetch current sync status & check if API key exists
    const statusResult = await query('SELECT tmdb_api_key FROM sync_status WHERE id = 1');
    const apiKey = statusResult.rows[0]?.tmdb_api_key || process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.log('ℹ️ No TMDB API Key found. Seeding premium curated fallback catalog...');
      await runPremiumOfflineSync();
      isSyncRunning = false;
      return;
    }

    // 2. Perform live TMDB Sync
    console.log('🔑 TMDB API Key detected. Synchronizing live content...');
    
    // Set status to running
    await query(
      'UPDATE sync_status SET status = $1, last_page = $2, processed_count = $3, total_count = $4, error_message = null WHERE id = 1',
      ['running', 0, 0, 160] // We sync 160 items total (40 per category)
    );

    await query(
      'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
      [0, 'running', 'Started live synchronization from TMDB API...']
    );

    // Sync categories configuration
    const categories = [
      {
        endpoint: '/discover/movie',
        industry: 'hollywood',
        type: 'movie',
        params: { with_original_language: 'en', sort_by: 'popularity.desc' }
      },
      {
        endpoint: '/discover/movie',
        industry: 'bollywood',
        type: 'movie',
        params: { with_original_language: 'hi', region: 'IN', sort_by: 'popularity.desc' }
      },
      {
        endpoint: '/discover/movie',
        industry: 'tollywood',
        type: 'movie',
        params: { with_original_language: 'te|ta', region: 'IN', sort_by: 'popularity.desc' }
      },
      {
        endpoint: '/discover/tv',
        industry: 'webseries',
        type: 'series',
        params: { sort_by: 'popularity.desc', with_original_language: 'en|hi|te' }
      }
    ];

    let processedCount = 0;

    for (let cIdx = 0; cIdx < categories.length; cIdx++) {
      if (shouldStopSync) {
        await handleInterrupt(processedCount);
        return;
      }

      const cat = categories[cIdx];
      console.log(`🎬 Syncing industry: ${cat.industry}...`);

      await query(
        'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
        [0, 'running', `Fetching popular titles for industry '${cat.industry}' from TMDB...`]
      );

      // Fetch discovery list (pages 1 and 2 to get 40 items total)
      let results = [];
      try {
        for (let page = 1; page <= 2; page++) {
          const pageData = await fetchFromTmdb(cat.endpoint, apiKey, { ...cat.params, page });
          if (pageData && pageData.results) {
            results = [...results, ...pageData.results];
          }
        }
      } catch (err) {
        console.warn(`⚠️ Failed to discover pages for ${cat.industry}:`, err.message);
      }
      results = results.slice(0, 40); // sync top 40 from each

      for (let itemIdx = 0; itemIdx < results.length; itemIdx++) {
        if (shouldStopSync) {
          await handleInterrupt(processedCount);
          return;
        }

        const tmdbItem = results[itemIdx];
        const isTv = cat.type === 'series';
        const id = `tmdb-${cat.type}-${tmdbItem.id}`;
        const title = isTv ? tmdbItem.name : tmdbItem.title;
        const genres = (tmdbItem.genre_ids || []).map(gid => TMDB_GENRES[gid] || 'Other');
        const synopsis = tmdbItem.overview || 'No synopsis available.';
        const poster_url = tmdbItem.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbItem.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80';
        const backdrop_url = tmdbItem.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbItem.backdrop_path}` : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200';
        
        const dateStr = isTv ? tmdbItem.first_air_date : tmdbItem.release_date;
        const year = dateStr ? parseInt(dateStr.slice(0, 4)) : 2024;
        
        const rating = parseFloat((tmdbItem.vote_average || 7.0).toFixed(1));
        const rt_rating = `${Math.min(100, Math.round(rating * 10 + (Math.random() * 10 - 5)))}%`;
        const originalLanguageName = tmdbItem.original_language === 'en' ? 'English' : tmdbItem.original_language === 'hi' ? 'Hindi' : tmdbItem.original_language === 'te' ? 'Telugu' : tmdbItem.original_language === 'ta' ? 'Tamil' : tmdbItem.original_language;
        const languages = [originalLanguageName];

        // Platforms
        const platforms = [
          { id: 'netflix', name: 'Netflix', price: 0 }
        ];
        if (Math.random() > 0.5) platforms.push({ id: 'prime', name: 'Prime Video', price: 0 });
        if (Math.random() > 0.7) platforms.push({ id: 'disney', name: 'Disney+', price: 0 });

        // Default trailer
        let trailer_id = isTv ? "gcTkFNGeTSc" : "dQw4w9WgXcQ"; // fallback

        // Default cast
        let cast_members = [];
        let cast_details = [];
        let runtime = isTv ? "1 Season" : "120 min";

        // Fetch deep details (trailers, credits, runtimes) with delay to avoid rate limiting
        try {
          await delay(200); // 200ms delay between items
          
          // Fetch Credits & Videos & Details
          const detailData = await fetchFromTmdb(isTv ? `/tv/${tmdbItem.id}` : `/movie/${tmdbItem.id}`, apiKey);
          if (detailData.runtime) {
            runtime = `${detailData.runtime} min`;
          } else if (detailData.number_of_seasons) {
            runtime = `${detailData.number_of_seasons} Season${detailData.number_of_seasons > 1 ? 's' : ''}`;
          }

          // Videos
          const videoData = await fetchFromTmdb(isTv ? `/tv/${tmdbItem.id}/videos` : `/movie/${tmdbItem.id}/videos`, apiKey);
          const youtubeTrailer = (videoData.results || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
          if (youtubeTrailer) {
            trailer_id = youtubeTrailer.key;
          }

          // Credits
          const creditData = await fetchFromTmdb(isTv ? `/tv/${tmdbItem.id}/credits` : `/movie/${tmdbItem.id}/credits`, apiKey);
          const tmdbCast = (creditData.cast || []).slice(0, 5);
          cast_members = tmdbCast.map(c => c.name);
          cast_details = tmdbCast.map(c => ({
            name: c.name,
            role: c.character || 'Cast Member',
            img: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
          }));
        } catch (err) {
          console.warn(`⚠️ Failed to fetch extra details for TMDB ID ${tmdbItem.id}:`, err.message);
        }

        const trailer_url = `https://www.youtube.com/watch?v=${trailer_id}`;

        // Insert into DB
        await query(
          `INSERT INTO movies (id, title, type, genres, cast_members, synopsis, poster_url, trailer_url, ratings, platforms, backdrop_url, year, runtime, languages, rt_rating, trailer_id, cast_details, industry)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             type = EXCLUDED.type,
             genres = EXCLUDED.genres,
             cast_members = EXCLUDED.cast_members,
             synopsis = EXCLUDED.synopsis,
             poster_url = EXCLUDED.poster_url,
             trailer_url = EXCLUDED.trailer_url,
             ratings = EXCLUDED.ratings,
             platforms = EXCLUDED.platforms,
             backdrop_url = EXCLUDED.backdrop_url,
             year = EXCLUDED.year,
             runtime = EXCLUDED.runtime,
             languages = EXCLUDED.languages,
             rt_rating = EXCLUDED.rt_rating,
             trailer_id = EXCLUDED.trailer_id,
             cast_details = EXCLUDED.cast_details,
             industry = EXCLUDED.industry,
             synced_at = NOW()`,
          [
            id,
            title,
            cat.type,
            genres,
            cast_members,
            synopsis,
            poster_url,
            trailer_url,
            rating,
            JSON.stringify(platforms),
            backdrop_url,
            year,
            runtime,
            languages,
            rt_rating,
            trailer_id,
            JSON.stringify(cast_details),
            cat.industry
          ]
        );

        processedCount++;

        // Update progress in sync_status
        await query(
          'UPDATE sync_status SET processed_count = $1, last_page = $2 WHERE id = 1',
          [processedCount, cIdx + 1]
        );
      }

      await query(
        'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
        [results.length, 'running', `Synchronized ${results.length} titles for '${cat.industry}'.`]
      );
    }

    // Complete Sync
    await query('UPDATE sync_status SET status = $1, updated_at = NOW() WHERE id = 1', ['completed']);
    await query(
      'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
      [processedCount, 'completed', `Successfully completed full live TMDB synchronization! Processed ${processedCount} titles.`]
    );

    console.log(`✅ TMDB sync completed successfully. Synced ${processedCount} items.`);

  } catch (err) {
    console.error('❌ Movie Sync Failed:', err.message);
    await query('UPDATE sync_status SET status = $1, error_message = $2 WHERE id = 1', ['failed', err.message]);
    await query(
      'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
      [0, 'failed', `Sync crashed with error: ${err.message}`]
    );
  } finally {
    isSyncRunning = false;
  }
}

// Seeding premium fallback catalog offline helper
async function runPremiumOfflineSync() {
  try {
    await query(
      'UPDATE sync_status SET status = $1, last_page = $2, processed_count = $3, total_count = $4, error_message = null WHERE id = 1',
      ['running', 0, 0, PREMIUM_OFFLINE_MOVIES.length]
    );

    await query(
      'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
      [0, 'running', 'Started offline sync of premium curated CineVerse catalog...']
    );

    let count = 0;
    for (const movie of PREMIUM_OFFLINE_MOVIES) {
      if (shouldStopSync) {
        await handleInterrupt(count);
        return;
      }

      await query(
        `INSERT INTO movies (id, title, type, genres, cast_members, synopsis, poster_url, trailer_url, ratings, platforms, backdrop_url, year, runtime, languages, rt_rating, trailer_id, cast_details, industry)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           type = EXCLUDED.type,
           genres = EXCLUDED.genres,
           cast_members = EXCLUDED.cast_members,
           synopsis = EXCLUDED.synopsis,
           poster_url = EXCLUDED.poster_url,
           trailer_url = EXCLUDED.trailer_url,
           ratings = EXCLUDED.ratings,
           platforms = EXCLUDED.platforms,
           backdrop_url = EXCLUDED.backdrop_url,
           year = EXCLUDED.year,
           runtime = EXCLUDED.runtime,
           languages = EXCLUDED.languages,
           rt_rating = EXCLUDED.rt_rating,
           trailer_id = EXCLUDED.trailer_id,
           cast_details = EXCLUDED.cast_details,
           industry = EXCLUDED.industry,
           synced_at = NOW()`,
        [
          movie.id,
          movie.title,
          movie.type,
          movie.genres,
          movie.cast_members,
          movie.synopsis,
          movie.poster_url,
          movie.trailer_url,
          movie.ratings,
          JSON.stringify(movie.platforms),
          movie.backdrop_url,
          movie.year,
          movie.runtime,
          movie.languages,
          movie.rt_rating,
          movie.trailer_id,
          JSON.stringify(movie.cast_details),
          movie.industry
        ]
      );
      count++;
      
      // Update status database entries
      await query(
        'UPDATE sync_status SET processed_count = $1, last_page = $2 WHERE id = 1',
        [count, Math.ceil(count / 10)]
      );

      // Simulate network wait slightly
      await delay(50);
    }

    await query('UPDATE sync_status SET status = $1, updated_at = NOW() WHERE id = 1', ['completed']);
    await query(
      'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
      [count, 'completed', `Completed offline premium sync. Synced ${count} pre-seeded titles.`]
    );

    console.log(`✅ Seeding of premium offline catalog completed. Synced ${count} items.`);

  } catch (err) {
    console.error('❌ Offline Seeding Failed:', err);
    await query('UPDATE sync_status SET status = $1, error_message = $2 WHERE id = 1', ['failed', err.message]);
  }
}

async function handleInterrupt(processedCount) {
  console.log(`⚠️ Sync interrupted. Saving progress at ${processedCount} records.`);
  await query(
    'UPDATE sync_status SET status = $1, processed_count = $2 WHERE id = 1',
    ['interrupted', processedCount]
  );
  await query(
    'INSERT INTO sync_logs (record_count, status, details) VALUES ($1, $2, $3)',
    [0, 'interrupted', `Sync interrupted. Synced ${processedCount} titles before stopping.`]
  );
  isSyncRunning = false;
}
