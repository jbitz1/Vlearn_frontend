import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Link } from "react-router";
import { Repeat, ShieldCheck, Presentation, ChevronRight, GraduationCap, PresentationIcon } from 'lucide-react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
import BASE_URL from '../config';

function Home() {
  // const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    date: '',
  })
  const [videoCount, setVideoCount] = useState(0)
  const form = useRef()

  // Fetching data on the categories from the JSON file
  useEffect(() => {
    const fetchVideoCount = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/video-count/`);
        console.log(response.data)
        setVideoCount(response.data)
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoCount();
  }, []);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 4,
    },
    tablet: {
      breakpoint: { max: 1023, min: 464 },
      items: 2,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('Demo_booking', 'template_9hq8xvb', form.current, 'cKnA1NtA8E441cRRU')
      .then(
        () => {
          successAlert();
          setFormData({
            name: '',
            email: '',
            school: '',
            date: '',
          })
        },
        () => {
          failureAlert();
          setFormData({
            name: '',
            email: '',
            school: '',
            date: '',
          })
        },
      );
    // function to show success alert prompt
    const successAlert = () => {
      Swal.fire({
        title: 'Success',
        text: 'Thank you for booking a demo',
        icon: 'success',
        confirmButtonText: 'OK',
      })
    };

    // function to show failure alert prompt
    const failureAlert = (message) => {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    };
  };

  const Categories = [
    {
      image:
        "https://d1ymz67w5raq8g.cloudfront.net/Pictures/2000xAny/7/0/9/511709_bromineinaflask_shutterstock_683941438_536395.jpg",
      title: "Gas Laws",
      description: "This chapter explores the properties and behavior of gases. You'll learn how gas particles move, how pressure, volume, and temperature are related, and discover real-life applications like air in tyres and balloons.",
    },
    {
      image:
        "https://www.chemicals.co.uk/wp-content/uploads/2021/09/titration-experiment-scaled.jpg",
      title: "The Mole",
      description: "In this topic, you'll learn how the mole helps chemists count particles and relate them to mass. You'll also explore how to convert between mass and moles, determine chemical formulas, prepare molar solutions, and solve problems involving concentration, titration, and gas volumes.",
    },
    {
      image:
        "https://t4.ftcdn.net/jpg/05/47/17/37/360_F_547173780_Og9qycLncoXm2ZWcFjBdGlDKql67uTin.jpg",
      title: "Organic Chemistry 1",
      description: "This chapter introduces organic chemistry and focuses on hydrocarbons—compounds made of carbon and hydrogen. You'll learn to classify them, draw their structures, understand isomers, explore their properties, and see how they’re used and prepared.",
    },
    {
      image:
        "https://assets.linde.com/-/media/celum-connect/2024/01/15/16/20/nitrogen_shutterstock_620270441_170628.png?impolicy=focal-point&cw=1200&ch=630&fx=1500&fy=1000&r=c580469973",
      title: "Nitrogen and its compounds",
      description: "Explore how nitrogen is obtained, its compounds like ammonia and nitric acid, and their properties, preparations, uses, and environmental impact. You'll also learn about nitrogen in fertilizers and related calculations.",
    },
    {
      image:
        "https://images.squarespace-cdn.com/content/v1/553e800ee4b04b98ae440e7b/1441099046122-MY4Y4H58H3JO0Z23NGPM/AdobeStock_60249891.jpg",
      title: "Sulphur and its compounds",
      description: "Learn about the sources, extraction, and uses of sulphur and its compounds. Explore how sulphuric acid is made, the properties of sulphur oxides, and the environmental effects of sulphur emissions.",
    },
    {
      image:
        "https://www.medigoapp.com/uploads/hydrochloric_acid_7_dc8263b24d.jpg",
      title: "Chlorine and its compounds",
      description: "This chapter explores the preparation, properties, and uses of chlorine and hydrogen chloride. You'll learn how solvents affect hydrogen chloride, how hydrochloric acid is made industrially, and the environmental impact of chlorine compounds."
    },
     {
      image:
        "https://www.medigoapp.com/uploads/hydrochloric_acid_7_dc8263b24d.jpg",
      title: "Chlorine and its compounds",
      description: "This chapter explores the preparation, properties, and uses of chlorine and hydrogen chloride. You'll learn how solvents affect hydrogen chloride, how hydrochloric acid is made industrially, and the environmental impact of chlorine compounds."
    },
  ];
  return (
    <>
      <Navbar />
      <section className='relative h-fit bg-[url(/images/Vlearn_bg1.png)] bg-cover bg-fixed bg-no-repeat'>
        <div className="absolute inset-0 bg-white/70 md:bg-white/50 z-0"></div>
        <div className="relative z-10 space-y-8 animate-fade-in items-center text-center mx-auto pt-36 md:pt-48 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mx-auto leading-snug max-w-4xl">
            Accessible Science Experiments for Every <span className='text-custom-blue'>Classroom</span> and <span className='text-custom-orange'>Learner</span>
          </h1>
          <p className="text-lg md:text-xl font-light max-w-3xl text-center leading-relaxed mx-auto">
            Learn science through step-by-step, high-quality experiment videos—designed for classrooms, remote schools, and individual learners. No lab required—just watch, understand, and explore science anytime, anywhere.</p>
          <div className="flex justify-center gap-6 items-center">
            <Link to="/dashboard">
              <button className="bg-custom-blue text-white px-4 py-3 rounded-full hover:bg-custom-orange hover:cursor-pointer transition-colors flex items-center">
                Start Learning <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <AnchorLink href='#demo'>
              <button className="border-1 text-custom-blue px-4 py-3 rounded-full hover:bg-white transition-colors hover:cursor-pointer hover:border-custom-orange">
                Book a demo
              </button>
            </AnchorLink>
          </div>
        </div>

        <div className="hover:cursor-pointer mt-10 relative z-10">
          <Link to='/dashboard'>
            <img
              src="images/Vlearnbg.png"
              alt="Vizlearn lms"
              className="w-full md:w-4/6 h-full mx-auto"
            />
          </Link>
        </div>
      </section>
      <section className="h-fit p-10 bg-white">
        <h2 className="text-4xl font-semibold mb-4 text-custom-blue text-center">
          Your learning adventure starts here.
        </h2>
        <p className='text-center mb-8 font-light text-lg'><span className='italic font-bold text-custom-orange text-2xl'>From experiments to simulations</span> — Take a peek at the topics that will shape your future.</p>
        <div id="categories" className="">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[20vh]">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-custom-blue border-solid"></div>
            </div>
          ) : (
            <Carousel
              swipeable={true}
              draggable={true}
              showDots={false}
              responsive={responsive}
              ssr={true}
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={5000}
              keyBoardControl={true}
              customTransition="transform 500ms ease-in-out"
              transitionDuration={2000}
              containerClassName="carousel-container"
              removeArrowOnDeviceType={["tablet", "mobile"]}
              deviceType={"desktop"}
              dotListClassName="absolute bottom-0 left-0 right-0 flex justify-center mb-4 custom-dot-list-style"
              itemClassName="carousel-item-wrapper"
              arrows={true}
              renderButtonGroupOutside={true}
            >
              {Categories.map((item, index) => (
                <div key={index} className="mx-5">
                  {/* Card */}
                  <div className="group overflow-hidden rounded-3xl relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 rounded-3xl to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-0">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-200 text-sm font-light">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-only title outside the card */}
                  <p className="text-center font-light mt-2 md:hidden">{item.title}</p>
                  <p className="text-center font-light mt-2 md:hidden text-sm">{item.description}</p>
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </section>
      <section className='h-fit py-10'>
        <div className="container mx-auto px-6 mb-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-custom-orange">Learning made simple</h2>
          <h3 className='text-center text-xl mb-10 font-light'> Get exclusive access to our repository of<span className='italic font-bold text-custom-orange'> {videoCount.count} </span> science experiment videos and enjoy...</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-6">
            {/* Feature 1 */}
            <div className="p-4 rounded-3xl bg-white hover:shadow-2xl hover:scale-105 hover:cursor-pointer transition-shadow duration-300 transform ">
              <div className="mb-4 flex justify-center items-center">
                <Presentation strokeWidth={1} className="h-16 w-16 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4 ">Accessible, Anytime Learning</h3>
              <p className="text-gray-600 font-light text-sm">Give every learner the opportunity to explore science through high-quality experiment videos—no lab required. Whether at school or home, students can access curriculum-aligned experiments whenever they need them. </p>
            </div>
            {/* Feature 2 */}
            <div className="p-4 rounded-3xl bg-white  hover:shadow-2xl hover:scale-105 hover:cursor-pointer transition-shadow duration-300 transform ">
              <div className="mb-4 flex justify-center items-center">
                <ShieldCheck strokeWidth={1} className="h-16 w-16 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4">See Every Step, Safely</h3>
              <p className="text-gray-600 font-light text-sm">Visualize complex experiments through clear, guided videos that eliminate risks while enhancing understanding. Learners get front-row views without exposure to harmful chemicals or unsafe conditions.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-3xl bg-white  hover:shadow-2xl hover:scale-105 hover:cursor-pointer transition-shadow duration-300 transform ">
              <div className="mb-4 flex justify-center items-center">
                <Repeat strokeWidth={1} className="h-16 w-16 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Watch, Pause, Repeat</h3>
              <p className="text-gray-600 font-light text-sm">Unlike live demos, students can revisit any experiment as many times as needed. This supports different learning speeds, strengthens retention, and builds confidence in scientific concepts.</p>
            </div>

          </div>
        </div>
      </section>
      <section className="bg-custom-blue py-20" id='demobooking'>
        <div className="container mx-auto px-6 " id="demo" >
          <h2 className="text-4xl font-bold text-white mb-6 text-center">
            Ready to Transform Your Science Class?
          </h2>
          <form
            ref={form}
            onSubmit={handleSubmit}
            className="flex flex-col mx-auto mt-10 w-full max-w-6xl gap-6  bg-white shadow-xl rounded-3xl p-8"
          >
            <h3 className="text-3xl font-bold text-black mb-4 text-center">
              Schedule a Demo
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Fill in the details below to book your demo session.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Full Name"
                  className="py-3 px-4 rounded-3xl w-full border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Email Address"
                  className="py-3 px-4 rounded-3xl w-full border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-900 mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  required
                  placeholder="Institution Name"
                  className="py-3 px-4 rounded-3xl w-full border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
                  Preferred Demo Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="py-3 px-4 rounded-3xl w-full border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-custom-blue w-full md:w-1/3 mx-auto text-white px-6 py-3 rounded-3xl hover:bg-custom-orange hover:cursor-pointer transition duration-300 ease-in-out flex items-center justify-center mt-4"
            >
              Get Started Now
              <GraduationCap className="ml-2 h-5 w-5" />

            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Home;
