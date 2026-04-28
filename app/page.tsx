'use client';

import AppLayout from './components/AppLayout';
import { useI18n } from './components/I18nProvider';
import Link from 'next/link';

export default function Home() {
  return (
    <AppLayout>
      <HomeContent />
    </AppLayout>
  );
}

function HomeContent() {
  const { t } = useI18n();
  const baseLinkClassName =
    'inline-flex w-36 justify-center text-white px-8 py-3 rounded-full transition-colors text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';

  return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{t('home.title')}</h1>
          <p className="text-gray-600 mb-8 text-lg">{t('home.subtitle')}</p>
          <div className="space-y-4">
            <div>
              <Link 
                href="/plan" 
                className={`${baseLinkClassName} bg-blue-600 hover:bg-blue-700`}
              >
                {t('home.startPlan')}
              </Link>
            </div>
            <div>
              <Link 
                href="/focus" 
                className={`${baseLinkClassName} bg-green-600 hover:bg-green-700`}
              >
                {t('home.focusMode')}
              </Link>
            </div>
            <div>
              <Link 
                href="/review" 
                className={`${baseLinkClassName} bg-purple-600 hover:bg-purple-700`}
              >
                {t('home.review')}
              </Link>
            </div>
            <div>
              <Link 
                href="/settings" 
                className={`${baseLinkClassName} bg-gray-600 hover:bg-gray-700`}
              >
                {t('home.settings')}
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
