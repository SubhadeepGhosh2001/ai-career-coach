import { industries } from '@/data/industries';
import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import OnboardingForm from './_components/onboarding-form';
const Onboarding = async() => {
  const {isOnboarded}=await getUserOnboardingStatus();
  if(isOnboarded){
    // Redirect to home page
    redirect('/dashboard');
  }
  return (
    <main>
      <OnboardingForm industries={industries}/>
    </main>
  )
}

export default Onboarding;
