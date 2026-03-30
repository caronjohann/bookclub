import SignInForm from './SignInform'

const SignInPage = () => {
  return (
    <section>
      <h1>Log in to get started.</h1>
      <button type="button">Continue with Google</button>
      <button type="button">Continue with Apple</button>
      <hr />
      <SignInForm />
    </section>
  )
}

export default SignInPage
