"use client";

import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  );
}

function YoutubeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
  );
}

function LinkedinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  );
}

const platforms = [
  {
    name: "Instagram",
    icon: InstagramIcon,
    handle: "@sumedhhkumar.ai",
    url: "https://www.instagram.com/sumedhhkumar.ai/",
    color: "from-pink-500 to-purple-500",
  },
  {
    name: "YouTube",
    icon: YoutubeIcon,
    handle: "@Sumedhhkumar",
    url: "https://www.youtube.com/@Sumedhhkumar/",
    color: "from-red-500 to-red-600",
  },
  {
    name: "LinkedIn",
    icon: LinkedinIcon,
    handle: "sumedhkumar-bhalerao",
    url: "https://www.linkedin.com/in/sumedhkumar-bhalerao/",
    color: "from-blue-500 to-blue-600",
  },
];

export default function Content() {
  return (
    <section id="content" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          title="Content Ecosystem"
          subtitle="I document everything publicly. Follow the journey."
        />

        <div className="grid sm:grid-cols-3 gap-6">
          {platforms.map((platform, i) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 text-center hover:border-accent/30 transition-colors duration-300 cursor-pointer"
            >
              <div
                className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-4`}
              >
                <platform.icon size={22} />
              </div>
              <h3 className="font-semibold">{platform.name}</h3>
              <p className="text-sm text-muted mt-1">{platform.handle}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
