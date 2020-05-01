#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <time.h>       /* time */
#include "matlib.h"
#include "neu.h"

using namespace std;

int main( int, char** argv )
{

    matrix *tmp;
    matrix *inLearning, *outLearning, *inTst, *outTst;

/*
    loadMattxt("wine.data",&tmp);

    initmat(&inLearning,    (tmp->rows*2/3), tmp->cols-1, 0.0);
    initmat(&inTst,         (tmp->rows/3),   tmp->cols-1, 0.0);
    initmat(&outLearning,   (tmp->rows*2/3),  3, 0.0);
    initmat(&outTst,        (tmp->rows/3),    3, 0.0);
    int l=0;
    for(int i=0; i<(tmp->rows-1); i=i+3)
    {
        for (int j=1; j< tmp->cols; j++)
        {
            elm(inLearning, l,   j-1)= elm(tmp, i,   j);
            elm(inLearning, l+1, j-1)= elm(tmp, i+1, j);
            elm(inTst,      i/3, j-1)= elm(tmp, i+2, j);
        }
        elm(outLearning, l,   ((int)elm(tmp, i,   0))-1) =1;
        elm(outLearning, l+1, ((int)elm(tmp, i+1, 0))-1) =1;
        elm(outTst,      i/3, ((int)elm(tmp, i+2, 0))-1) =1;
        l=l+2;
    }

    saveMattxt("inLearning.txt",inLearning);
    saveMattxt("inTst.txt",inTst);
    saveMattxt("outLearning.txt",outLearning);
    saveMattxt("outTst.txt",outTst);

*/
    loadMattxt("inLearning.txt",  &inLearning);
    loadMattxt("inTst.txt",       &inTst);
    loadMattxt("outLearning.txt", &outLearning);
    loadMattxt("outTst.txt",      &outTst);

    matrix *inLearningNorm, *inTstNorm, *uext;

    initmat(&inLearningNorm, inLearning->rows,  inLearning->cols, 0.0);
    initmat(&inTstNorm,      inTst->rows,        inTst->cols, 0.0);
    initmat(&uext,           inLearning->cols,   2, 0.0);

    matnormp(inLearning, &inLearningNorm, &uext, 1);
    matnormpext(inTst, &inTstNorm, uext, 1);

    saveMatD("uext", uext);

    matrix *nninput, *nnoutput;
    initmat(&nninput,   inTst->cols,  1, 0.0);
    initmat(&nnoutput,  outTst->cols, 1, 0.0);

    int antin=      inLearning->cols;
    int antN=       6;
    int antout=     outLearning->cols;
    int antEpochs=  1000;

    matrix *perf, *perfTst;
    initmat(&perf,antEpochs,antout,0.0);
    initmat(&perfTst,antEpochs,antout,0.0);

    mlp_net *nn_net;
    srand (time(NULL));
    mlp_gaussinit(&nn_net, antin, antN, antout, 0.0, .4);

    initmat(&tmp,inLearningNorm->rows, max(inLearningNorm->cols,outLearning->cols), 0.0);

    for (int l=0; l< antEpochs; l++)
    {

        mlp_train(nn_net, inLearningNorm, outLearning, 20, 0.02);

        ShuffleMat(inLearningNorm, outLearning, tmp);

        CalcPerf(nn_net, &perf,inLearningNorm, outLearning,l);
        CalcPerf(nn_net, &perfTst,inTstNorm, outTst,l);

    }

    save_bpenet("MLPNet.nn",nn_net);
    saveMattxt("perf.txt",perf);
    saveMattxt("perfTst.txt",perfTst);



    int NoErr=0;
    for (int j = 0; j < inTst->rows; j++)
    {
        for (int k = 0; k < inTst->cols; k++)
            elm(nninput, k, 0) = elm(inTstNorm, j, k);

        bpe_forward(nninput, nn_net, &nnoutput);

        printf("Net out: \t\t%6.2f\t\t%6.2f \t\t%6.2f\n",elm(nnoutput,0,0), elm(nnoutput,1,0), elm(nnoutput,2,0));
        printf("Desired: \t\t%6.2f\t\t%6.2f \t\t%6.2f\n\n",elm(outTst,j,0), elm(outTst,j,1), elm(outTst,j,2));

        if (((elm(outTst,j,0)==1)&&(elm(nnoutput,0,0) <0.5)) ||
                ((elm(outTst,j,1)==1)&&(elm(nnoutput,1,0) <0.5)) ||
                ((elm(outTst,j,2)==1)&&(elm(nnoutput,2,0) <0.5))) NoErr++;

    }
    printf("No. of errors: %d\n",NoErr);
    write_bpenet(nn_net);
    return 0;
}
