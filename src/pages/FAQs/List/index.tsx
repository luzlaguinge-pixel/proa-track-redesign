import { useMemo } from 'react';

import { IconChevronDown } from '@material-hu/icons/tabler';
import Accordion from '@material-hu/mui/Accordion';
import AccordionDetails from '@material-hu/mui/AccordionDetails';
import AccordionSummary from '@material-hu/mui/AccordionSummary';
import Divider from '@material-hu/mui/Divider';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Title from '@material-hu/components/design-system/Title';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useProfile } from '../../../providers/ProfileContext';
import { FAQS, FAQ_CATEGORIES, type FAQ } from './constants';

export const FAQsList = () => {
  const { perfil } = useProfile();

  const filteredCategories = useMemo(() => {
    if (perfil === 'navegante') {
      return ['General', 'Solicitudes', 'Confirmaciones'] as const;
    }
    return FAQ_CATEGORIES;
  }, [perfil]);

  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQ[]> = {};

    filteredCategories.forEach(category => {
      grouped[category] = FAQS.filter(faq => {
        // Filter by category
        if (faq.category !== category) return false;

        // Filter by profile if forProfiles is specified
        if (faq.forProfiles && !faq.forProfiles.includes(perfil)) {
          return false;
        }

        return true;
      }).sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [filteredCategories, perfil]);

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        <Title
          title="Preguntas frecuentes"
          description="Encuentra respuestas a tus dudas sobre Proa Track."
          variant="L"
        />

        <Stack sx={{ gap: 3 }}>
          {filteredCategories.map((category, categoryIndex) => (
            <Stack key={category} sx={{ gap: 1.5 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 600, letterSpacing: '0.08em' }}
              >
                {category}
              </Typography>

              <Stack sx={{ gap: 0.5 }}>
                {faqsByCategory[category].map((faq, faqIndex) => (
                  <Accordion
                    key={faq.id}
                    sx={{
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { m: 0 },
                      bgcolor: 'transparent',
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<IconChevronDown size={20} />}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': { bgcolor: 'action.hover' },
                        '& .MuiAccordionSummary-content': {
                          m: 0,
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        py: 2,
                        px: 2,
                        bgcolor: 'action.hover',
                        borderTop: '1px solid',
                        borderTopColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>

              {categoryIndex < filteredCategories.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </DashboardLayout>
  );
};

export default FAQsList;
