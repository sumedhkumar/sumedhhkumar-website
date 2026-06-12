type SectionIntroProps = {
  eyebrow?: string;
  heading: string;
  copy?: string;
};

export default function SectionIntro({
  eyebrow,
  heading,
  copy,
}: SectionIntroProps) {
  return (
    <div className="section-intro">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title" style={{ marginTop: eyebrow ? 12 : 0 }}>
        {heading}
      </h2>
      {copy ? (
        <p className="body-large" style={{ marginTop: 16 }}>
          {copy}
        </p>
      ) : null}
    </div>
  );
}
