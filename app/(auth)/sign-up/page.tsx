import SignUpForm from './SignUpForm'

const SignUpPage = () => {
  return (
    <section>
      <h1>Your book tracking is just a sign-up away.</h1>
      <button type="button">Continue with Google</button>
      <button type="button">Continue with Apple</button>
      <hr />
      <SignUpForm />
    </section>
  )
}

export default SignUpPage
