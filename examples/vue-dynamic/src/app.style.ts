import { atomStyle, keyframes } from "@usacss/vue"

export const route = keyframes("route", {
  "0%": {
    transform: "rotate(0deg)"
  },
  "100%": {
    transform: "rotate(360deg)"
  }
})
export const imgStyle = atomStyle({
  width: "120px",
  height: "120px",
  animation: "route 3s linear infinite"
})

export const inputStyle = atomStyle({
  width: "100%",
  color: {
    "::placeholder": "red"
  }
})

export const flexCenterStyle = atomStyle({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column"
})

export const containerStyle = atomStyle({
  margin: "0 auto",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  gap: "2rem",
  background: {
    value: "#f5f5f5",
    ":hover": "#f2f2f2",
    "@media screen and (max-width: 600px) ": "slateblue",
    "@media screen and (max-width: 600px) &:hover": "black"
  },
  boxShadow: {
    "@mode sun": "0 0 20px 30px rgba(255, 255, 0, 0.5),inset 0 0 20px 30px rgba(255, 255, 0, 0.5)",
    "@mode moon": "0 0 20px 30px rgba(255, 0, 0, 0.5),inset 0 0 20px 30px rgba(0, 0, 0, 0.4)"
  }
})
