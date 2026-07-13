import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary";

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = CommonProps &
  {
    href: string;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    rel?: string;
    style?: CSSProperties;
    target?: string;
  };

type NativeButtonProps = CommonProps & {
  href?: never;
  disabled?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
};

type ButtonProps = LinkButtonProps | NativeButtonProps;

function isLinkButton(props: ButtonProps): props is LinkButtonProps {
  return typeof (props as LinkButtonProps).href === "string";
}

export default function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    className = "",
  } = props;
  const classes = `btn btn-${variant} ${className}`.trim();
  const disabled = props.disabled === true;

  if (isLinkButton(props)) {
    const { href, onClick, rel, style, target } = props;

    return (
      <a
        href={disabled ? undefined : href}
        onClick={onClick}
        rel={rel}
        style={style}
        target={target}
        aria-disabled={disabled ? "true" : undefined}
        className={`${classes}${disabled ? " btn-disabled" : ""}`}
      >
        {children}
      </a>
    );
  }

  const { id, onClick, style, type = "button" } = props;

  return (
    <button
      disabled={disabled || undefined}
      id={id}
      onClick={onClick}
      style={style}
      suppressHydrationWarning
      type={type}
      className={classes}
    >
      {children}
    </button>
  );
}
