import { useEffect, useMemo, useRef, useState } from "react";
import "./Carrers.css";
import careerHeaderBg from "../../assets/carrer_header_background.png";

import viewAllIcon from "../../assets/view_all.png";
import consultingIcon from "../../assets/consulting.png";
import trainingIcon from "../../assets/Training.png";
import operationsIcon from "../../assets/operations.png";
import internshipsIcon from "../../assets/interships.png";
import itDepartementIcon from "../../assets/depertements.png";
import marketingIcon from "../../assets/marketing.png";
import designIcon from "../../assets/Design.png";

import principlesImg from "../../assets/principales.jpg";

import jobBagIcon from "../../assets/job_bag.png";
import jobFigmaIcon from "../../assets/job_figma.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

function useInView(options = { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return [ref, inView];
}

const tabs = [
  { id: "view-all", label: "View all", icon: viewAllIcon },
  { id: "consulting", label: "Consulting", icon: consultingIcon },
  { id: "training", label: "Training", icon: trainingIcon },
  { id: "operations", label: "Operations", icon: operationsIcon },
  { id: "internships", label: "Internships", icon: internshipsIcon },
  { id: "it-departement", label: "It departement", icon: itDepartementIcon },
  { id: "marketing", label: "Marketing", icon: marketingIcon },
  { id: "design", label: "Design", icon: designIcon },
];

const jobs = [
  {
    id: 1,
    tab: "design",
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Design intuitive web and mobile experiences for enterprise clients. Collaborate with product, tech, and strategy teams.",
    icon: jobFigmaIcon,
    about:
      "As a UX Designer on our team, you will shape user experiences by leading the design of key features and projects. Your responsibilities include defining user experience flows, developing new product concepts, and crafting user stories. You will design detailed UI layouts, create benchmarks, and develop high-fidelity prototypes while documenting UX and UI strategies. Collaborating with technical teams, you will transform designs into impactful, industry-leading products. This role combines creativity and problem-solving to create meaningful user experiences.",
    journey: [
      "A supportive manager who cares about your well-being and is invested in your professional growth.",
      "A culture of continuous learning with clear targets and feedback.",
      "A global company with over 260 employees located in more than 26 countries, including offices in 3 countries.",
    ],
    responsibilities: [
      "Showcase proficiency in collaborative design environments.",
      "Demonstrate ability to work independently, think critically, and maintain meticulous attention to detail.",
      "Solid grasp of interactive elements, micro-interactions, and animations, contributing to a seamless user experience.",
      "Clear understanding of the entire UX lifecycle, coupled with a track record of designing successful apps and products.",
      "Deep passion for digital product development and an unwavering commitment to achieving excellence.",
    ],
    benefits: [
      "Embrace work-life balance with hybrid/remote roles and flexible hours.",
      "Enjoy 22 days + Birthday + Carnival Tuesday.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
  {
    id: 2,
    tab: "design",
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Design intuitive web and mobile experiences for enterprise clients. Collaborate with product, tech, and strategy teams.",
    icon: jobFigmaIcon,
    about:
      "Lead the creation of intuitive experiences for web and mobile products while partnering closely with product managers and engineers.",
    journey: [
      "A strong design culture with space to experiment.",
      "Continuous growth and peer feedback.",
      "Cross-functional collaboration on impactful products.",
    ],
    responsibilities: [
      "Create wireframes, flows, and polished UI designs.",
      "Collaborate with product and engineering teams.",
      "Present design ideas clearly to stakeholders.",
    ],
    benefits: [
      "Flexible schedule.",
      "Growth budget and supportive team culture.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
  {
    id: 3,
    tab: "design",
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Design intuitive web and mobile experiences for enterprise clients. Collaborate with product, tech, and strategy teams.",
    icon: jobFigmaIcon,
    about:
      "Drive user-centered product experiences from discovery to delivery in a collaborative environment.",
    journey: [
      "Clear goals and measurable outcomes.",
      "Mentorship and design reviews.",
      "Opportunity to shape meaningful products.",
    ],
    responsibilities: [
      "Define end-to-end experience flows.",
      "Build prototypes and test ideas quickly.",
      "Maintain design consistency across products.",
    ],
    benefits: [
      "Remote-friendly environment.",
      "Paid time off and learning support.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
  {
    id: 4,
    tab: "consulting",
    title: "Business Transformation Consultant",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Support organizations in digital transformation projects. Lead workshops and deliver strategic recommendations.",
    icon: jobBagIcon,
    about:
      "Support organizations through digital transformation initiatives, delivering strategic recommendations and execution support.",
    journey: [
      "Work on high-impact transformation projects.",
      "Collaborate with multidisciplinary teams.",
      "Grow through exposure to real institutional challenges.",
    ],
    responsibilities: [
      "Lead workshops and discovery sessions.",
      "Develop transformation roadmaps.",
      "Support implementation and change adoption.",
    ],
    benefits: [
      "Flexible hybrid work setup.",
      "Professional development opportunities.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
  {
    id: 5,
    tab: "design",
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Design intuitive web and mobile experiences for enterprise clients. Collaborate with product, tech, and strategy teams.",
    icon: jobFigmaIcon,
    about:
      "Help shape delightful digital products through thoughtful research, clean interface design, and collaboration.",
    journey: [
      "Meaningful projects with measurable impact.",
      "Strong collaboration with stakeholders.",
      "Healthy feedback and support culture.",
    ],
    responsibilities: [
      "Turn insights into elegant interfaces.",
      "Communicate design decisions clearly.",
      "Contribute to the design system.",
    ],
    benefits: [
      "Flexible work options.",
      "Generous paid leave.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
  {
    id: 6,
    tab: "design",
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Blida, Algeria",
    shortLocation: "Algiers, Alger, Algerie - HY A1",
    workplace: "On Site",
    level: "Senior level",
    salary: "Up to 65K/Yr",
    remote: "Remote",
    description:
      "Design intuitive web and mobile experiences for enterprise clients. Collaborate with product, tech, and strategy teams.",
    icon: jobFigmaIcon,
    about:
      "Own UX strategy and interface design for products used in demanding, real-world environments.",
    journey: [
      "Global team environment.",
      "Clear ownership and responsibility.",
      "Room to innovate and improve systems.",
    ],
    responsibilities: [
      "Design user journeys and task flows.",
      "Create detailed high-fidelity UI.",
      "Work with developers to ensure quality implementation.",
    ],
    benefits: [
      "Flexible work and supportive leadership.",
      "Learning and development support.",
    ],
    salaryRange: "$50.00 - $60.00 Per/H",
  },
];

const principles = [
  { title: "Commitment to Results", desc: "We commit only to what can be achieved and measured." },
  { title: "Unrestricted Partnership", desc: "Clients are partners in decision-making and execution." },
  { title: "Transparency and Trust", desc: "Full clarity from day one." },
  { title: "Long-term Impact", desc: "We build solutions that last beyond the engagement." },
];

const Careers = () => {
  const [activeTab, setActiveTab] = useState("view-all");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [ctaRef, ctaInView] = useInView();

  const filteredJobs = useMemo(() => {
    if (activeTab === "view-all") return jobs;
    return jobs.filter((job) => job.tab === activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedJobId && !filteredJobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(null);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) || null;

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSelectedJobId(null);
  };

  const handleViewDetails = (jobId) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;
    setActiveTab(job.tab);
    setSelectedJobId(jobId);
  };

  const handleBackToGrid = () => {
    setSelectedJobId(null);
  };

  return (
    <>
      <section className="career-header">
        <div
          className="career-header__container"
          style={{ backgroundImage: `url(${careerHeaderBg})` }}
        >
          <p className="career-header__tag">Join our team</p>

          <h1 className="career-header__title">
            Build Systems. Create Impact.
            <br />
            Grow With Purpose
          </h1>

          <p className="career-header__description">
            At Bawssala, we design institutional transformation. We are looking
            for professionals who think structurally, work with discipline, and
            measure their impact.
          </p>

          <button className="career-header__button">View Opportunities</button>
        </div>
      </section>

      <section className="open-positions">
        <div className="open-positions__container">
          {!selectedJob ? (
            <>
              <h2 className="open-positions__title">Open positions</h2>

              <p className="open-positions__subtitle">
                browse our current openings and see how you can contribute to our
                expanding mission
              </p>

              <div className="open-positions__tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`open-positions__tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => handleTabClick(tab.id)}
                    type="button"
                  >
                    <span
                      className="open-positions__tab-icon"
                      style={{
                        WebkitMaskImage: `url(${tab.icon})`,
                        maskImage: `url(${tab.icon})`,
                      }}
                    ></span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="open-positions__divider"></div>
            </>
          ) : (
            <div className="open-positions__details-top">
              <button
                type="button"
                className="open-positions__back"
                onClick={handleBackToGrid}
              >
                <span className="open-positions__back-arrow">‹</span>
                <span>All jobs</span>
              </button>

              <div className="open-positions__selected-job">
                <img
                  src={selectedJob.icon}
                  alt={selectedJob.title}
                  className="open-positions__selected-job-icon"
                />
                <span className="open-positions__selected-job-title">
                  {selectedJob.title}
                </span>
              </div>
            </div>
          )}

          <div className="jobs-section">
            {!selectedJob ? (
              <div className="jobs-grid">
                {filteredJobs.map((job, index) => (
                  <div
                    className="job-card"
                    key={job.id}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="job-card__top">
                      <div className="job-card__icon-wrapper">
                        <img
                          src={job.icon}
                          alt={job.title}
                          className="job-card__icon"
                        />
                      </div>

                      <div className="job-card__content">
                        <h3 className="job-card__title">{job.title}</h3>

                        <div className="job-card__meta">
                          <span className="job-card__badge">{job.type}</span>
                          <span className="job-card__badge">{job.location}</span>
                        </div>

                        <p className="job-card__description">{job.description}</p>
                      </div>
                    </div>

                    <div className="job-card__actions">
                      <button
                        type="button"
                        className="job-card__button job-card__button--outline"
                        onClick={() => handleViewDetails(job.id)}
                      >
                        View details
                      </button>

                      <button
                        type="button"
                        className="job-card__button job-card__button--primary"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="job-details-layout">
                <aside className="job-details-sidebar">
                  <div className="job-details__sidebar-list">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`job-sidebar-card ${
                          selectedJob.id === job.id ? "is-active" : ""
                        }`}
                        onClick={() => setSelectedJobId(job.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedJobId(job.id);
                          }
                        }}
                      >
                        <div className="job-sidebar-card__top">
                          <div className="job-card__icon-wrapper job-card__icon-wrapper--small">
                            <img
                              src={job.icon}
                              alt={job.title}
                              className="job-card__icon job-card__icon--small"
                            />
                          </div>

                          <div className="job-sidebar-card__content">
                            <h4 className="job-sidebar-card__title">{job.title}</h4>

                            <div className="job-card__meta job-card__meta--sidebar">
                              <span className="job-card__badge">{job.type}</span>
                              <span className="job-card__badge">{job.location}</span>
                            </div>

                            <p className="job-sidebar-card__desc">{job.description}</p>
                          </div>
                        </div>

                        <div className="job-sidebar-card__actions">
                          <button
                            type="button"
                            className="job-card__button job-card__button--outline"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="job-card__button job-card__button--primary"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="job-details-panel" key={selectedJob.id}>
                  <div className="job-details-panel__header">
                    <h3 className="job-details-panel__title">{selectedJob.title}</h3>
                    <p className="job-details-panel__location">
                      {selectedJob.shortLocation} | {selectedJob.workplace}
                    </p>

                    <div className="job-details-panel__tags">
                      <span className="job-details-panel__tag">{selectedJob.remote}</span>
                      <span className="job-details-panel__tag">{selectedJob.type}</span>
                      <span className="job-details-panel__tag">{selectedJob.level}</span>
                      <span className="job-details-panel__tag">{selectedJob.salary}</span>
                    </div>

                    <button
                      type="button"
                      className="job-details-panel__apply"
                    >
                      Apply Now
                    </button>
                  </div>

                  <div className="job-details-panel__tabs">
                    <button type="button" className="job-details-panel__tab is-active">
                      Job Description
                    </button>
                    <button type="button" className="job-details-panel__tab">
                      Requirement
                    </button>
                    <button type="button" className="job-details-panel__tab">
                      Benefit
                    </button>
                  </div>

                  <div className="job-details-panel__section">
                    <h4 className="job-details-panel__section-title">
                      What will make your journey with us unique?
                    </h4>
                    <ul className="job-details-panel__list">
                      {selectedJob.journey.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="job-details-panel__section">
                    <h4 className="job-details-panel__block-heading">Requirement</h4>

                    <h5 className="job-details-panel__section-title">What will you do</h5>
                    <p className="job-details-panel__paragraph">{selectedJob.about}</p>

                    <h5 className="job-details-panel__section-title">What You'll Bring</h5>
                    <ul className="job-details-panel__list">
                      {selectedJob.responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="job-details-panel__section">
                    <h4 className="job-details-panel__block-heading">Benefit</h4>

                    <h5 className="job-details-panel__section-title">Base Pay Range</h5>
                    <p className="job-details-panel__paragraph">
                      {selectedJob.salaryRange}
                    </p>

                    <h5 className="job-details-panel__section-title">What's in it for you?</h5>
                    <ul className="job-details-panel__list">
                      {selectedJob.benefits.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="principles">
        <div className="principles__container">
          <h2 className="principles__title">The Principles That Guide Our Work</h2>

          <p className="principles__subtitle">
            At Bawsala, values are not slogans. They are practical principles that
            shape our approach, strengthen partnerships, and ensure measurable impact.
          </p>

          <div className="principles__grid">
            <div className="principles__imageWrap">
              <img
                className="principles__image"
                src={principlesImg}
                alt="Team working session"
                loading="lazy"
              />
            </div>

            <div className="principles__list">
              {principles.map((p, idx) => (
                <div
                  className={`principles__item ${idx === 0 ? "is-active" : ""}`}
                  key={idx}
                >
                  <div className="principles__content">
                    <h3 className="principles__itemTitle">{p.title}</h3>
                    <p className="principles__itemDesc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className={`contactCta reveal ${ctaInView ? "is-inView" : ""}`}>
        <div className="contactCta__container">
          <div className="contactCta__card">
            <div className="contactCta__avatars" aria-hidden="true">
              <img className="contactCta__avatar contactCta__avatar--1" src={profile1} alt="" />
              <img className="contactCta__avatar contactCta__avatar--2" src={profile2} alt="" />
              <img className="contactCta__avatar contactCta__avatar--3" src={profile3} alt="" />
            </div>

            <h3 className="contactCta__title reveal__item">Still have questions?</h3>
            <p className="contactCta__subtitle reveal__item">
              Can’t find the answer you’re looking for? Please chat to our friendly team.
            </p>

            <a className="contactCta__btn reveal__item" href="/contact">
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Careers;